import type { RunResult } from './Runner';
import { Runner } from "./Runner";
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import { expect } from 'chai';
import * as os from 'os';
import { createSandbox } from 'sinon';
const sinon = createSandbox();

const tempDir = path.join(process.cwd(), '.tmp');
describe('Runner', () => {
    let runner: Runner;
    beforeEach(() => {
        sinon.restore();
        fsExtra.ensureDirSync(tempDir);
        fsExtra.emptydirSync(tempDir);
        runner = new Runner({
            cwd: tempDir,
            files: ['**/*']
        });
    });

    afterEach(() => {
        sinon.restore();
        fsExtra.emptydirSync(tempDir);
    });

    function writeDefaultFiles() {
        writeFiles({
            'lf.txt': 'hello\nworld',
            'crlf.txt': 'hello\r\nworld',
            'mixed.txt': 'hello\nworld\r\nhow are you?',
            'none.txt': 'no newline'
        });
    }

    function writeFiles(files: Record<string, string>) {
        for (const file in files) {
            fsExtra.outputFileSync(path.join(tempDir, file), files[file]);
        }
    }

    it('lf', async () => {
        writeDefaultFiles();
        expectResult(await runner.run(), [
            'valid lf lf.txt',
            'invalid crlf crlf.txt',
            'invalid mixed mixed.txt',
            'valid none none.txt',
        ]);
    });

    it('crlf', async () => {
        runner.options.eol = 'crlf';
        writeDefaultFiles();
        expectResult(await runner.run(), [
            'invalid lf lf.txt',
            'valid crlf crlf.txt',
            'invalid mixed mixed.txt',
            'valid none none.txt',
        ]);
    });

    it('platform windows', async () => {
        runner.options.eol = 'platform';
        sinon.stub(os, 'platform').returns('win32');
        writeDefaultFiles();
        expectResult(await runner.run(), [
            'invalid lf lf.txt',
            'valid crlf crlf.txt',
            'invalid mixed mixed.txt',
            'valid none none.txt',
        ]);
    });

    it('platform mac', async () => {
        runner.options.eol = 'platform';
        sinon.stub(os, 'platform').returns('darwin');
        writeDefaultFiles();
        expectResult(await runner.run(), [
            'valid lf lf.txt',
            'invalid crlf crlf.txt',
            'invalid mixed mixed.txt',
            'valid none none.txt',
        ]);
    });

    it('uses process.cwd when cwd is omitted', () => {
        runner.options.cwd = undefined;
        expect(runner['cwd']).to.eql(process.cwd());
    });
});

function expectResult(actual: RunResult, expected: string[]) {
    const actualResults = [actual.invalid, actual.valid]
        .flatMap(x => x.map(x => `${x.type.toLowerCase()} ${standardizePath(x.filePath)}`))
        .sort();

    const expectedResults = expected.map(x => {
        const [, type, thePath] = /(mixed|lf|crlf|none)\s+(.*)/.exec(x) ?? [];
        return `${type.toLowerCase()} ${standardizePath(`${tempDir}/${thePath}`)}`;
    }).sort();
    expect(actualResults).to.eql(expectedResults);
}

export function s(stringParts: string[], ...expressions: any[]) {
    let chunks = [];
    for (let i = 0; i < stringParts.length; i++) {
        chunks.push(stringParts[i], expressions[i]);
    }
    return standardizePath(
        chunks.join('')
    );
}

function standardizePath(thePath: string) {
    let result = thePath;
    //force drive letter to lower case
    if (/^[a-z]:/i.exec(result)) {
        result = result.substr(0, 1).toLowerCase() + result.substr(1);
    }
    //replace all path separators with the current OS path sep
    result = result.replace(/[\\\/]/g, path.sep);
    return path.normalize(result);
}
