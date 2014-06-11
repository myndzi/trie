'use strict';

var Deque = require('double-ended-queue');

var sentinel = 0x110000,
    sentinel$ = String(sentinel); // 1 greater than max utf-8 valid character value

module.exports = Trie;

function Node() {
  this[sentinel] = true; // force HashMap<int, val>
  Object.defineProperty(this, 'values', {
    enumerable: false,
    configurable: false,
    writable: true,
    value: [ ]
  });
}
Node.prototype = null;

function Trie() {
  this.root = new Node();
  this.seq = 1;
}

Trie.or = function (ptr, res, matchSeq, markSeq) {
  var vals = ptr.values, i, x, j = res.length;
  
  for (i = 0, x = vals.length; i < x; i++) {
    if (vals[i].__mark === matchSeq) { continue; }
    vals[i].__mark = markSeq;
    res[j++] = vals[i];
  }
  return res;
}
Trie.and = function (ptr, res, matchSeq, markSeq) {
  var vals = ptr.values, i, x, j = 0;
  
  for (i = 0, x = vals.length; i < x; i++) {
    if (vals[i].__mark !== matchSeq) { continue; }
    vals[i].__mark = markSeq;
    
    res[j++] = vals[i];
  }
  res.length = j;
  
  return res;
};

Trie.prototype = Object.create(null);

// Trie.add(text, val)
// store 'val' at the node for 'text'
Trie.prototype.add = function (newVal, indexes) {
  if (!newVal || typeof newVal !== 'object') { throw new Error('Must supply an object to store'); }
  if (typeof indexes === 'string') { indexes = [ indexes ]; }
  else if (!indexes || !indexes.push) { throw new Error('Must supply a string or array of strings to index by'); }

  var i = 0, x = indexes.length, ptr, vals;
  Object.defineProperty(newVal, '__mark', {
    enumerable: false,
    configurable: false,
    writable: true,
    value: 0
  });
  
  for (; i < x; i++) {
    ptr = this._seek(indexes[i], true);
    vals = ptr.values;
    if (vals.indexOf(newVal) > -1) continue;
    vals[vals.length] = newVal;
  };
};

Trie.prototype.find = function (text) {
  if (!text) { return [ ]; }
  if (text.push) { return this.findAny(text); }
  if (typeof text !== 'string') { return [ ]; }
  
  var ptr = this._seek(text);
  return (ptr ? ptr.values.slice(0) : [ ]);
};

Trie.prototype.findAny = function (arr) {
  if (!arr.length) { return [ ]; }
  
  var i = 0, x = arr.length, ptr, res = [ ];
  
  for (; i < x; i++) {
    ptr = this._seek(arr[i]);
    if (!ptr) { continue; }
    res = Trie.or(ptr, res, this.seq, this.seq);
  }
  // only need to increment once
  this.seq++;
  
  return res;
};
Trie.prototype.findAll = function (arr) {
  if (!arr.length) { return [ ]; }
  
  var i = 0, x = arr.length, ptr, res = [ ];
  
  // seed the pot
  ptr = this._seek(arr[i]);
  if (!ptr) { return [ ]; }
  res = Trie.or(ptr, res, this.seq, this.seq);
  
  for (i = 1; i < x; i++) {
    // need to increment every iteration to exclude previous matches
    ptr = this._seek(arr[i]);
    if (!ptr) { continue; }
    res = Trie.and(ptr, res, this.seq, this.seq+1);
    this.seq++;
  }
  
  return res;
};

Trie.prototype.findPrefix = function (text) {
  if (!text) { return [ ]; }
  if (text.push) { return this.findPrefixAny(text); }
  if (typeof text !== 'string') { return [ ]; }
  
  var ptr = this._seek(text), res = [ ];
  if (!ptr) { return [ ]; }
  res = this._children(Trie.or, ptr, res, this.seq, this.seq);
  this.seq++;
  
  return res;
};

Trie.prototype.findPrefixAny = function (arr) {
  if (!arr || !arr.push || !arr.length) { return [ ]; }
  
  var i = 0, x = arr.length, ptr, res = [ ];
  
  for (; i < x; i++) {
    ptr = this._seek(arr[i]);
    if (ptr === null) { continue; }
    res = this._children(Trie.or, ptr, res, this.seq, this.seq);
  }
  // only need to increment once
  this.seq++;
  
  return res;
};
Trie.prototype.findPrefixAll = function (arr) {
  if (!arr || !arr.push || !arr.length) { return [ ]; }
  
  var i = 0, x = arr.length, ptr, res = [ ];
  
  ptr = this._seek(arr[i]);
  if (!ptr) { return [ ]; }
  res = this._children(Trie.or, ptr, res, this.seq, this.seq);
  
  for (i = 1; i < x; i++) {
    ptr = this._seek(arr[i]);
    if (!ptr) { continue; }
    res = this._children(Trie.and, ptr, res, this.seq, this.seq+1);
    // need to increment every iteration to exclude previous matches
    this.seq++;
  }
  
  return res;
};
Trie.prototype._seek = function (text, extend) {
  var i = 0, x = text.length, ptr = this.root;
  if (extend) { return this._extend(text); }
  
  for (; i < x; i++) {
    if (ptr[text.charCodeAt(i)] === void 0) {
      return null;
    } else {
      ptr = ptr[text.charCodeAt(i)];
    }
  }
  return ptr || null;
};
Trie.prototype._extend = function (text) {
  var i = 0, x = text.length,
      chr, ptr = this.root;
  for (; i < x; i++) {
    chr = text.charCodeAt(i);
    if (ptr[chr] === void 0) {
      ptr = ptr[chr] = new Node();
    } else {
      ptr = ptr[chr];
    }
  }
  return ptr;
};
Trie.prototype._stack = new Deque();
Trie.prototype._children = function (fn, ptr, res, matchSeq, markSeq) {
  var cur, vals, keys, i, x,
      j = res.length,
      stack = this._stack;
  
  if (!ptr) { throw new Error(); }
  
  stack.clear();
  stack.push(ptr);
  
  while (stack.length) {
    cur = stack.pop();

    keys = Object.keys(cur);
    for (i = 0, x = keys.length; i < x; i++) {
      if (keys[i] === sentinel$) { continue; }
      stack.push(cur[keys[i]]);
    }

    vals = cur.values;
    if (!vals.length) { continue; }
    res = fn(cur, res, matchSeq, markSeq);
  }
  
  return res;
};
