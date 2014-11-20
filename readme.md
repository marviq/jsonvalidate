#JSON VALIDATE

This script is used to validate JSON files against one or more JSON-schemas.
(See [json-schema.org](http://json-schema.org/documentation.html))

The script has been tested for json-schema draft 3 and 4.

##Installation

Tested on node-0.10.x and node.11.x, requires npm.

    $ npm install -g jsonvalidate
    
This will install the script globally according to your system and you can use it as a standard commandline tool

##Usage

    $ jsonvalidate
    
    Usage: jsonvalidate [options]
    
    Options:
       -f, --file     JSON file  [-]
       -e, --extra    extra JSON schema file
       -s, --schema   JSON schema file
       -d, --debug    Debug logging

If no file is provided, the default, '-' is taken, stdin is used as input:

    $ cat foo.json | jsonvalidate -s fooschema.json

Extra schemas can be loaded for included schemas:

    $ jsonvalidate -f foobar.json -s foo-schema.json -e bar-schema.json
   
   
