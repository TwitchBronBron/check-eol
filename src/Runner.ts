import * as fg from 'fast-glob';
import * as fsExtra from 'fs-extra';
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

    public getExpectedLineEnding() {
        const eolLower = this.options.eol?.toLowerCase();
        console.log(eolLower, os.platform());

        if (eolLower === 'crlf') {
            return 'crlf';
        } else if (eolLower === 'platform') {
            return os.platform() === 'win32' ? 'crlf' : 'lf';
        } else {
            return 'lf';

        }
    }

    public async run() {
        const result = {
            valid: [] as FileResult[],
            invalid: [] as FileResult[]
        } as RunResult;

        const expectedLineEnding = this.getExpectedLineEnding();

        const stream = fg.stream(this.options.files, {
            cwd: this.cwd,
            absolute: true,
            followSymbolicLinks: true,
            onlyFiles: true
        });

        const pending: Promise<void>[] = [];
        for await (const filePath of stream) {
            pending.push(
                this.processFile(filePath as string).then(fileResult => {
                    if (fileResult.type === 'none' || fileResult.type === expectedLineEnding) {
                        result.valid.push(fileResult);
                    } else {
                        result.invalid.push(fileResult);
                    }
                })
            );
        }

        await Promise.all(pending);
        const sortByPath = (a: FileResult, b: FileResult) => a.filePath.localeCompare(b.filePath);
        result.valid.sort(sortByPath);
        result.invalid.sort(sortByPath);
        return result;
    }

    private async processFile(filePath: string) {
        const buffer = await fsExtra.readFile(filePath);
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
        } as FileResult;
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

export interface FileResult {
    filePath: string;
    type: 'lf' | 'crlf' | 'mixed' | 'none';
}

export interface RunResult {
    valid: FileResult[];
    invalid: FileResult[];
}
