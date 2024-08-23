/*
 * Title:Data
 * Description: Handle Data
 * Author: Md. Ripon Khan
 * Date: 09/08/24
 * */

// Dependencies
const { dir } = require('console');
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, './../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);
            // write data to the file and then close it
            fs.writeFile(fileDescriptor, stringData, (writeError) => {
                if (!writeError) {
                    fs.close(fileDescriptor, (closeError) => {
                        if (!closeError) {
                            callback(false);
                        } else {
                            callback('Error closing to new file');
                        }
                    });
                } else {
                    callback('Error writing  to new file!');
                }
            });
        } else {
            callback('Can not create new file, it may already exists!');
        }
    });
};
// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (readError, data) => {
        callback(readError, data);
    });
};
// update data from file
lib.update = (dir, file, data, callback) => {
    // open file for update
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (updateError, fileDescriptor) => {
        if (!updateError && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (truncateError) => {
                if (!truncateError) {
                    fs.writeFile(fileDescriptor, stringData, (writeError) => {
                        if (!writeError) {
                            fs.close(fileDescriptor, (closeError) => {
                                if (!closeError) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error write file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Error Updating, file may not exits');
        }
    });
};
// delete data from file
lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (error) => {
        if (!error) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

// list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err1, fileNames) => {
        if (!err1 && fileNames && fileNames.length > 0) {
            const trimmedFileNames = [];
            fileNames.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback('error reading directory');
        }
    });
};

module.exports = lib;
