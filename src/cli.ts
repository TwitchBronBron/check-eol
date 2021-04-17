import * as yargs from 'yargs';
import { Runner } from './Runner';
import * as chalk from 'chalk';

yargs
    .usage('$0', 'check-line-endings, a cli for validating consistent line endings')
    .help('help', 'View help information about this tool.')
    .option('eol', {
        description: `What line ending is required. If 'platform' is specified, then windows will be CRLF, and all other operating systems will be LF`,
        type: 'string',
        default: 'lf',
        choices: ['lf', 'crlf', 'platform']
    })
    .command('$0 [files..]', '', () => { }, async (argv: any) => {
        try {
            const runner = new Runner(argv);
            const result = await runner.run();
            if (result.invalid.length > 0) {
                console.error(`Found ${result.invalid.length} files with non-${runner.getExpectedLineEnding()} line endings`);
                for (const fileResult of result.invalid) {
                    console.log(chalk.red(fileResult.type.padEnd(5)), chalk.green(fileResult.filePath));
                }
                process.exit(1);
            }
        } catch (e) {
            console.error(e?.message || e);
            process.exit(1);
        }
    })
    .argv;
