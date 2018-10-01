"use strict";
const proxyquire = require('proxyquire');
const assert     = require("assert");
const sinon      = require("sinon");

let utilsProxy   = {};

let REST = proxyquire('../../lib/rest', {
    "./utils": utilsProxy,
}).default;

describe('start_workflow', () => {

    it('should start a workflow_instance', () => {
        var client = new REST({
	    "url"    : "http://metrichor.test:8080",
            "apikey" : "FooBar02"
        });

        utilsProxy._post = (uri, id, obj, options, cb) => {
	    assert.equal(uri, "workflow_instance");
            assert.equal(id,  null);
            assert.equal(options.apikey, "FooBar02");
            assert.equal(obj.id_workflow, "test");
            cb(null, {"id_workflow_instance":"1","id_user":"1"});
            delete utilsProxy._post;
        };

        client.start_workflow({id_workflow: 'test'}, (err, obj) => {
            assert.equal(err, null, 'no error reported');
            assert.deepEqual(obj, {"id_workflow_instance":"1","id_user":"1"}, 'workflow_instance start response');
        });
    });
});