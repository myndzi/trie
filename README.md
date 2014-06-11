# What is this?

I wanted something that would allow me to efficiently look up lines in a log file by multiple words. This is what I wrote.

# Examples

Simple usage

    var trie = new Trie(),
        myObj = { foo: 'bar' };
    
    trie.add(myObj, 'key1');
    trie.find('key1'); // -> [ myObj ]

Multiple indexes

    var trie = new Trie(),
        myObj = { foo: 'bar' };
    
    trie.add(myObj, ['key1', 'key2']);
    trie.add(myObj, 'key3');
    
    trie.find('key1'); // -> [ myObj ]
    trie.find('key2'); // -> [ myObj ]
    trie.find('key3'); // -> [ myObj ]

Children

    var trie = new Trie(),
        myObj = { foo: 'bar' };
    
    trie.add(myObj, ['key1', 'key2']);
    
    trie.findPrefix('k'); // -> [ myObj ]

Union

    var trie = new Trie(),
        foo = { foo: true },
        bar = { bar: true };
    
    trie.add(foo, 'foo');
    trie.add(bar, 'bar');
    
    trie.findAny(['foo', 'bar']); // -> [ foo, bar ]

Intersection

    var trie = new Trie(),
        foo = { foo: true },
        bar = { bar: true };
    
    trie.add(foo, 'foo');
    trie.add(foo, 'bar');
    trie.add(bar, 'bar');

    trie.findAll(['foo', 'bar']); // -> [ foo ]

With children

    var trie = new Trie(),
        foo = { foo: true },
        bar = { bar: true },
        baz = { baz: true };
    
    trie.add(foo, 'foo');
    trie.add(bar, 'food');
    trie.add(baz, 'goo');
    trie.add(bar, 'good');
    
    trie.findPrefixAny('foo', 'goo') -> [ foo, bar, baz ]
    trie.findPrefixAll('foo', 'goo') -> [ bar ]

Test

    npm test
