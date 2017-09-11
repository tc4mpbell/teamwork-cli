#!/usr/bin/env nodejs

/************************************************************************************
 * Main script - parses arguments
 ************************************************************************************/
const versionNo = "0.9.9";

const dateFormat = require('dateformat');
const functions = require('./common-functions.js');
const { interactiveMode, usage } = require('./interactive-mode.js');


/**
 * Parses the arguments provided to the program
 *
 * @param args Array of program arguments
 */
const parseProgramArguments = (args) => {

    // parse arguments
    let argList = {};

    // creates an object for the arglist object
    const getArgEntry = (letter, argument, description, defaultValue) => {
        return { letter, description, argument, "provided":false, "value":defaultValue };
    }

    // help
    argList['help'] = getArgEntry('h',null,'Print this help Screen', false);
    argList['version'] = getArgEntry('v',null,'Print version info', false);

    // interactive
    argList['interactive'] = getArgEntry('i',null,'Enter interactive mode', false);

    // lists of info
    argList['time-logged'] = getArgEntry('l',null,'Print time logged', false);
    argList['tasks'] = getArgEntry('p',null,'Print a list of previous entered tasks for the year', '');
    argList['entries'] = getArgEntry('q',null,'Print entries of today or date specified', false);

    // time logging
    argList['entry'] = getArgEntry('e',null,'Enter time with below options', false);
    argList['billable'] = getArgEntry('b','[0/1]','If billable time (default 1)', true);
    argList['hours'] = getArgEntry('H','[hours]','Set hours to log (default 0)', 0);
    argList['minutes'] = getArgEntry('M','[minutes]','Set minutes to log (default 0)', 0);
    argList['date'] = getArgEntry('d','[yyyymmdd]','Set date to log for (default today)', dateFormat(new Date(), "yyyymmdd"));
    argList['description'] = getArgEntry('m','[message]','Set description to log (default empty)', '');
    argList['task'] = getArgEntry('t','[taskId]','Set the taskId to log to (see --tasks)', '');

    if (args !== undefined) {
        Object.keys(argList).forEach( key => {

            const index = Math.max(args.indexOf(`-${argList[key].letter}`), args.indexOf(`--${key}`));

            if (index > -1) {
                if (args.length > index) {
                    argList[key].provided = true;
                    argList[key].value = args[index+1];
                }
            }
        });
    }

    return argList;
}

/**
 * Prints Version of program
 */
const printVersionInfo = () => {
    console.log(`hours ${versionNo}\n`);
}

/**
 * Print Usage for the utility
 */
const printUsage = () => {

    printVersionInfo();

    const argList = parseProgramArguments();

    console.log('OPTIONS');
    Object.keys(argList).forEach( key => {

        const letter = argList[key].letter;
        const description = argList[key].description;
        const optArg = argList[key].argument == null ? "" : argList[key].argument;

        // Print option, key, description
        console.log('\n\t' + `-${letter}, --${key} ${optArg}` + '\n\t' + description)}
    );

    console.log('\nEXAMPLES');
    console.log(`
        nodejs hours.js --entry --task 6905921 --hours 1 --minutes 30 --billable 0 --description "Friday Standup"
        Logs an hour and a half for a long Friday standup

        nodejs hours.js -e -t 6905921 -H 1 -M 30 -b 0 -m "Friday Standup"
        Same as above but using letters instead
        `
    );

    console.log('\nINTERACTIVE MODE\n')
    usage();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "Main"
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const args = process.argv;

// if no arguments, just print time logged
if (args.length < 3) {
    functions.printTimeLogged();
}
else {

    const argList = parseProgramArguments(args);

    // do work
    if (argList['help'].provided) {
        printUsage();
    }
    else {

        if (argList['entry'].provided) {

            const entry = argList;
            entry.taskId = entry.task;
            entry.isbillable = entry.billable;

            const resp = functions.sendTimeEntry(entry);
            console.log(resp);
        }
        else if (argList['tasks'].provided) {
            functions.printPreviousTasks();
        }

        if (argList['time-logged'].provided) {
            functions.printTimeLogged();
        }

        if (argList['version'].provided) {
            printVersionInfo();
        }

        if (argList['entries'].provided) {
            functions.printDateEntries(argList['date'].value);
        }

        if (argList['interactive'].provided) {
            interactiveMode();
        }
    }
}
