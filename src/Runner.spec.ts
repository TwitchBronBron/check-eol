import { Runner } from "./Runner";

describe('Runner', () => {
    beforeEach(() => {
    });

    it('defaults to lf', async () => {
        const runner = new Runner({
            files: ['lf.txt']
        });
        await runner.run();
    });
});
