#!/usr/bin/env node

var cli = require('cloudnode-cli'),
    command = process.argv[0],
    cmds = cli.commands;
    
cli.run(cmds, command);
