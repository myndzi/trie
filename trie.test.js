var assert = require('assert'),
    should = require('should'),
    Trie = require('./trie');

describe('Trie', function () {
    describe('#add', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true };
            
        it('should add items', function () {
            trie.add(oFoo, 'foo');
        });
        it('should add arrays of items', function () {
            trie.add(oBar, ['keke', 'lar']);
        });
        it('should not add duplicates', function () {
            trie.add(oFoo, 'foo');
            trie.find('foo').length.should.equal(1);
        });
        it('should throw when not passed an object', function () {
            var msg = 'Must supply an object to store';
            (function () { trie.add(1, 'key'); }).should.throw(msg);
            (function () { trie.add(null, 'key'); }).should.throw(msg);
            (function () { trie.add(); }).should.throw(msg);
        });
        it('should throw when not passed an array or string for indexes', function () {
            var msg = 'Must supply a string or array of strings to index by';
            (function () { trie.add(oFoo, 1); }).should.throw(msg);
            (function () { trie.add(oFoo, null); }).should.throw(msg);
            (function () { trie.add(oFoo); }).should.throw(msg);
        });
    });
    describe('#find', function () {
        var trie = new Trie();
        var oFoo = { foo: true };
        
        trie.add(oFoo, 'foo');
        
        it('should retrieve values by key', function () {
            trie.find('foo')[0].should.equal(oFoo);
        });
        it('should return the same value for the same key more than once', function () {
            trie.find('foo')[0].should.equal(oFoo);
        });
        it('should call findAny if passed an array', function (done) {
            trie.findAny = done.bind(null, null);
            trie.find([]);
        });
    });
    describe('#findAny', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true };
            
        trie.add(oFoo, 'foo');
        trie.add(oBar, 'bar');
        
        it('should retrieve the union of the specified keys', function () {
            var res = trie.findAny(['foo', 'bar']);
            res.should.containEql(oFoo);
            res.should.containEql(oBar);
            res.length.should.equal(2);
        });
        it('should allow nonexistent keys', function () {
            var res = trie.findAny(['hai']);
            res.length.should.equal(0);
        });
    });
    describe('#findAll', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true },
            oKeke = { keke: true };
            
        trie.add(oFoo, 'foo');
        trie.add(oBar, 'bar');
        trie.add(oBar, 'foo');
        trie.add(oKeke, 'keke');
        
        it('should retrieve the intersection of the specified keys', function () {
            var res = trie.findAll(['foo', 'bar']);
            res.should.not.containEql(oFoo);
            res.should.containEql(oBar);
        });
        it('should return an empty array with no matches', function () {
            var res = trie.findPrefixAll(['foo', 'keke']);
            res.length.should.equal(0);
        });
        it('should allow nonexistent keys', function () {
            var res = trie.findAny(['lar']);
            res.length.should.equal(0);
        });

    });
    describe('#findPrefix', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true },
            oKeke = { keke: true };
            
        trie.add(oBar, 'bar');
        trie.add(oBar, 'baz');
        trie.add(oFoo, 'bar');
        trie.add(oKeke, 'b');

        it('should retrieve all children of prefix', function () {
            var res = trie.findPrefix('ba');
            res.should.containEql(oBar);
            res.should.containEql(oFoo);
            res.should.not.containEql(oKeke);
        });
        it('should include the matched node', function () {
            var res = trie.findPrefix('b');
            res.should.containEql(oKeke);
        });
        it('should not return duplicates', function () {
            var res = trie.findPrefix('b');
            res.should.containEql(oFoo);
            res.should.containEql(oBar);
            res.should.containEql(oKeke);
            
            res.length.should.equal(3);
        });
        it('should allow nonexistent keys', function () {
            var res = trie.findPrefix('lar');
            res.length.should.equal(0);
        });
        it('should call findPrefixAny when passed an array', function (done) {
            trie.findPrefixAny = done.bind(null, null);
            trie.findPrefix([]);
        });
    });
    describe('#findPrefixAny', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true },
            oKeke = { keke: true },
            oLar = { lar: true };
            
        trie.add(oFoo, 'foo');
        trie.add(oBar, 'bar');
        trie.add(oKeke, 'food');
        trie.add(oLar, 'lar');
            
        it('should return the union of the matched nodes and their children', function () {
            var res = trie.findPrefixAny(['foo', 'bar']);
            res.should.containEql(oFoo);
            res.should.containEql(oBar);
            res.should.containEql(oKeke);
            res.should.not.containEql(oLar);
            
            res.length.should.equal(3);
        });
        it('should allow nonexistent keys', function () {
            var res = trie.findPrefixAll(['keke']);
            res.length.should.equal(0);
        });
    });
    describe('#findPrefixAll', function () {
        var trie = new Trie();
        var oFoo = { foo: true },
            oBar = { bar: true },
            oKeke = { keke: true },
            oLar = { lar: true };
            
        trie.add(oFoo, 'foo');
        trie.add(oBar, 'bar');
        trie.add(oKeke, 'food');
        trie.add(oLar, 'lar');
        trie.add(oFoo, 'barbie');
            
        it('should return the intersection of the matched nodes and their children', function () {
            var res = trie.findPrefixAll(['foo', 'bar']);
            res.length.should.equal(1);
            res[0].should.equal(oFoo);
        });
        it('should return an empty array with no matches', function () {
            trie.findPrefixAll(['foo', 'bar', 'lar']).length.should.equal(0);
        });
        it('should allow nonexistent keys', function () {
            trie.findPrefixAll(['zebra']).length.should.equal(0);
        });
    });
});
