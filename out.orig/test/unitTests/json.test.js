"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const json_1 = require("../../src/json");
suite("JSON", () => {
    suiteSetup(() => chai_1.should());
    test("no comments", () => {
        const text = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(text);
    });
    test("no comments (minified)", () => {
        const text = `{"hello":"world","from":"json"}`;
        const expected = `{
    "hello": "world",
    "from": "json"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("single-line comment before JSON", () => {
        const text = `// comment
{
    "hello": "world\\"" // comment
}`;
        const expected = `{
    "hello": "world\\""
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("single-line comment on separate line", () => {
        const text = `{
    // comment
    "hello": "world"
}`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("single-line comment at end of line", () => {
        const text = `{
    "hello": "world" // comment
}`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("single-line comment at end of text", () => {
        const text = `{
    "hello": "world"
} // comment`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore single-line comment inside string", () => {
        const text = `{
    "hello": "world // comment"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(text);
    });
    test("single-line comment after string with escaped double quote", () => {
        const text = `{
    "hello": "world\\"" // comment
}`;
        const expected = `{
    "hello": "world\\""
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("multi-line comment at start of text", () => {
        const text = `/**/{
    "hello": "world"
}`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("comment out key/value pair", () => {
        const text = `{
    /*"hello": "world"*/
    "from": "json"
}`;
        const expected = `{
    "from": "json"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("multi-line comment at end of text", () => {
        const text = `{
    "hello": "world"
}/**/`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore multi-line comment inside string", () => {
        const text = `{
    "hello": "wo/**/rld"
}`;
        const expected = `{
    "hello": "wo/**/rld"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore BOM", () => {
        const text = `\uFEFF{
    "hello": "world"
}`;
        const expected = `{
    "hello": "world"
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore trailing comma in object member list", () => {
        const text = `{
    "obj": {
        "hello": "world",
        "from": "json",
    }
}`;
        const expected = `{
    "obj": {
        "hello": "world",
        "from": "json"
    }
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore trailing comma in array element list", () => {
        const text = `{
    "array": [
        "element1",
        "element2",
    ]
}`;
        const expected = `{
    "array": [
        "element1",
        "element2"
    ]
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
    test("ignore trailing comma in object member list with leading and trailing whitespace", () => {
        const text = `{
    "obj": { "a" : 1 , }
}`;
        const expected = `{
    "obj": {
        "a": 1
    }
}`;
        let json = json_1.tolerantParse(text);
        let result = JSON.stringify(json, null, 4);
        result.should.equal(expected);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC91bml0VGVzdHMvanNvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsK0JBQThCO0FBQzlCLHlDQUErQztBQUUvQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNmLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLE1BQU0sSUFBSSxHQUNOOztFQUVWLENBQUM7UUFFSyxJQUFJLElBQUksR0FBRyxvQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUzQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQ04saUNBQWlDLENBQUM7UUFFdEMsTUFBTSxRQUFRLEdBQ1Y7OztFQUdWLENBQUM7UUFFSyxJQUFJLElBQUksR0FBRyxvQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUzQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDekMsTUFBTSxJQUFJLEdBQ047OztFQUdWLENBQUM7UUFFSyxNQUFNLFFBQVEsR0FD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