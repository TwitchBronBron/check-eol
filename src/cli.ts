import * as yargs from 'yargs';
import { Runner } from './Runner';

yargs
    .usage('$0', 'check-line-endings, a cli for validating consistent line endings')
    .help('help', 'View help information about this tool.')
    .option('eol', {
        description: `What line ending is required. If 'platform' is specified, then windows will be CRLF, and all other operating systems will be LF`,
        type: 'string',
        default: 'lf',
        choices: ['lf', 'crlf', 'platform']
    })
    .command('$0 [files..]', '', () => { }, (argv: any) => {
        const runner = new Runner(argv);
        runner.run().catch((e) => {
            console.error(e?.message || e);
            process.exit(1);
        });
    })
    .argv;
