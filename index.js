#!/usr/bin/env node
'use strict';

var fs = require('fs'),
    tv4 = require('tv4'),
    winston = require('winston'),
	opts = require('nomnom')
	.script('jsonvalidate')
	.options(
		{
		  'file': {
			  abbr: 'f',
			  help: 'JSON file',
			  required: true,
			  default: '-'
			},
			'extra': {
			  abbr: 'e',
			  help: 'extra JSON schema file',
			  list: true
			},
            'schema': {
              abbr: 's',
              help: 'JSON schema file',
              required: true
            },
            'debug': {
              abbr: 'd',
              flag: true,
              help: 'Debug logging',
              required: false
            }
		}
	).parse()
  , debug = opts.debug
  , logger = new winston.Logger({
    transports:[
      new ( winston.transports.Console ) ({
        colorize: true,
        level: "debug",
        silent: !debug
      })
    ]
  })
  , filename = opts.file
  , schemaname = opts.schema
  , extranames = opts.extra
  , instream = null
  , schemaString = fs.readFileSync(schemaname, 'utf8')
  , schema = JSON.parse(schemaString)
  , infile
;

function validateInputData(data, schema) {
	// console.log("data: ", data);
	// console.log("schema: ", schema);
	logger.info('Starting validation');
	var result = tv4.validateMultiple(data, schema, true, true);

	// console.log(tv4.error);
	// console.log(tv4.missing);
	if (result) {
		for(var i = 0; i < result.errors.length; i++) {
			delete result.errors[i].stack;
		}
		process.stdout.write(JSON.stringify(result, null, 4));
	} else {
		process.stdout.write("{}");
	}
    process.stdout.write("\n");
}

if (extranames) {
	logger.info("Extra schemas ", JSON.stringify(extranames));

	for(var i = 0; i < extranames.length; i++) {
		var eschemaString = extranames[i]
		  , eschema = eschemaString.split(':')
	 	  , eschemaname
	 	  , eschemafile
	 	  , eschemaString
	 	  , eschemaobject
		;

		if (eschema.length != 2) {
			logger.error("Error: extra schema " + eschemaString + " is not of the form 'URL:file");
			process.exit(-1);
		}
		eschemaname = eschema[0];
		eschemafile = eschema[1];
		eschemaString = fs.readFileSync(eschemafile, 'utf8');
		eschemaobject = JSON.parse(eschemaString);

		if (eschemaobject.id) {
			logger.debug("Adding schema by id " + eschemaobject.id)
			tv4.addSchema(eschemaobject);
		} else {
			logger.debug("Adding schema " + eschemaname);
			tv4.addSchema(eschemaname, eschemaobject);
		}

	}

	logger.debug("Extra schemas loaded", JSON.stringify(tv4.getSchemaMap(), null ,2));
}

if (filename === "-") {
	instream = process.openStdin();
    instream.on("data", function(data) {
    	if (infile) {
    		infile += data;
    	} else {
    		infile = data;
    	}
    });
    instream.on("end", function() {
    	logger.debug("infile: ", infile.toString('utf8'));

    	validateInputData(JSON.parse(infile.toString('utf8')), schema);
    });
} else {
	infile = fs.readFileSync(filename, 'utf8');

	validateInputData(JSON.parse(infile), schema);
}
