import { fdir } from 'fdir';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class Runner {
    constructor(
        public options: RunnerOptions
    ) {

    }

    private get cwd() {
        return path.resolve(this.options.cwd ?? process.cwd());
    }

    private getExpectedLineEnding() {
        const eolLower = this.options.eol?.toLowerCase();

        if (eolLower === 'crlf') {
            return 'crlf';
        } else if (eolLower === 'platform') {
            return os.platform() === 'win32' ? 'crlf' : 'lf';
        } else {
            return 'lf';

        }
    }

    public async run() {
        //find all the matching files
        const files = await this.getFiles();

        //process each file
        const results = await Promise.all(
            files.map(x => this.processFile(x))
        );

        var shouldFail = false;
        var expectedLineEnding = this.getExpectedLineEnding();
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            //skip files with no line endings
            if (result.type === 'none') {
                continue;
            }
            if (result.type === 'mixed' || result.type !== expectedLineEnding) {
                shouldFail = true;
                console.log(result.filePath);
                console.log('    Found', result.type, 'line endings but expected', expectedLineEnding.toUpperCase());
            }
        }
        if (shouldFail === true) {
            return Promise.reject('Some line endings were incorrect');
        }
    }

    private getFiles() {
        return new fdir()
            .withBasePath()
            .glob(...this.options.files)
            .crawl(this.cwd)
            .withPromise() as Promise<string[]>;
    }

    private getFileContents(filePath: string) {
        return new Promise<Buffer>(function (resolve) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    return Promise.reject(err);
                }
                return data;
            });
        })
    }

    private async processFile(filePath: string) {
        const buffer = await this.getFileContents(filePath);
        var text = buffer.toString();
        var regexp = /\r?\n/g;
        var foundLF = false;
        var foundCRLF = false;
        var type;
        var match;
        while (match = regexp.exec(text)) {
            foundLF = foundLF || match[0] === '\n';
            foundCRLF = foundCRLF || match[0] === '\r\n';
            //if we found both, no need to scan the rest of the file
            if (foundLF && foundCRLF) {
                break;
            }
        }

        if (foundLF && foundCRLF) {
            type = 'mixed';
        } else if (foundLF && !foundCRLF) {
            type = 'lf';
        } else if (!foundLF && foundCRLF) {
            type = 'crlf';
        } else {
            type = 'none';
        }

        return {
            filePath: filePath,
            type: type
        }
    }
}

interface RunnerOptions {
    /**
     * The current working directory where this Runner should operate
     */
    cwd?: string;
    /**
     * What the desired line endings should be.
     * if 'platform' is specified, then windows will be crlf, and all other operating systems will be lf.
     * @default 'lf'
     */
    eol?: 'lf' | 'crlf' | 'platform';
    /**
     * An array of file paths or globs that should be checked
     */
    files: string[];
}
