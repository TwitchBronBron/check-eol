import { Runner } from "./Runner";
import * as path from 'path';
import * as fsExtra from 'fs-extra';

const tempDir = path.join(process.cwd(), '.tmp');
describe('Runner', () => {
    let runner: Runner;
    beforeEach(() => {
        fsExtra.ensureDirSync(tempDir);
        fsExtra.emptydirSync(tempDir);
        runner = new Runner({
            cwd: tempDir,
            files: []
        });
    });

    afterEach(() => {
        fsExtra.emptydirSync(tempDir);
    });

    function writeFiles(files: Record<string, string>) {
        for (const file in files) {
            fsExtra.outputFileSync(path.join(tempDir, file), files[file]);
        }
    }

    it('defaults to lf', async () => {
        runner.options.files = ['lf.txt'];
        writeFiles({
            'lf.txt': 'hello\nworld'
        });
        //should succeed
        await runner.run();
    });

    it('defaults to lf and catches crlf', async () => {
        runner.options.files = ['*.txt'];
        writeFiles({
            'lf.txt': 'hello\r\nworld'
        });
        //should crash
        await expectThrowsAsync(async () => {
            await runner.run();
        });
    });
});

async function expectThrowsAsync(callback: () => Promise<void | any>) {
    let threw = false;
    try {
        await callback();
    } catch (e) {
        threw = true;
    }
    if (threw === false) {
        throw new Error('Expected exception to be thrown, but none was');
    }
}
