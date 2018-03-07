"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function isLineBreak(code) {
    return code === 10 /* lineFeed */
        || code === 13 /* carriageReturn */
        || code === 11 /* verticalTab */
        || code === 12 /* formFeed */
        || code === 8232 /* lineSeparator */
        || code === 8233 /* paragraphSeparator */;
}
function isWhitespace(code) {
    return code === 32 /* space */
        || code === 9 /* tab */
        || code === 10 /* lineFeed */
        || code === 11 /* verticalTab */
        || code === 12 /* formFeed */
        || code === 13 /* carriageReturn */
        || code === 133 /* nextLine */
        || code === 160 /* nonBreakingSpace */
        || code === 5760 /* ogham */
        || (code >= 8192 /* enQuad */ && code <= 8203 /* zeroWidthSpace */)
        || code === 8232 /* lineSeparator */
        || code === 8233 /* paragraphSeparator */
        || code === 8239 /* narrowNoBreakSpace */
        || code === 8287 /* mathematicalSpace */
        || code === 12288 /* ideographicSpace */
        || code === 65279 /* byteOrderMark */;
}
function cleanJsonText(text) {
    let parts = [];
    let partStart = 0;
    let index = 0;
    let length = text.length;
    function next() {
        const result = peek();
        index++;
        return result;
    }
    function peek(offset = 0) {
        if ((index + offset) < length) {
            return text.charCodeAt(index + offset);
        }
        else {
            return undefined;
        }
    }
    function peekPastWhitespace() {
        let pos = index;
        let code = undefined;
        do {
            code = text.charCodeAt(pos);
            pos++;
        } while (isWhitespace(code));
        return code;
    }
    function scanString() {
        while (true) {
            if (index >= length) {
                break;
            }
            let code = next();
            if (code === 34 /* doubleQuote */) {
                // End of string. We're done
                break;
            }
            if (code === 92 /* backSlash */) {
                // Skip escaped character. We don't care about verifying the escape sequence.
                // We just don't want to accidentally scan an escaped double-quote as the end of the string.
                index++;
            }
            if (isLineBreak(code)) {
                // string ended unexpectedly
                break;
            }
        }
    }
    while (true) {
        let code = next();
        switch (code) {
            // byte-order mark
            case 65279 /* byteOrderMark */:
                // We just skip the byte-order mark
                parts.push(text.substring(partStart, index - 1));
                partStart = index;
            // strings
            case 34 /* doubleQuote */:
                scanString();
                break;
            // comments
            case 47 /* slash */:
                // Single-line comment
                if (peek() === 47 /* slash */) {
                    // Be careful not to include the first slash in the text part.
                    parts.push(text.substring(partStart, index - 1));
                    // Start after the second slash and scan until a line-break character is encountered.
                    index++;
                    while (index < length) {
                        if (isLineBreak(peek())) {
                            break;
                        }
                        index++;
                    }
                    partStart = index;
                }
                // Multi-line comment
                if (peek() === 42 /* asterisk */) {
                    // Be careful not to include the first slash in the text part.
                    parts.push(text.substring(partStart, index - 1));
                    // Start after the asterisk and scan until a */ is encountered.
                    index++;
                    while (index < length) {
                        if (peek() === 42 /* asterisk */ && peek(1) === 47 /* slash */) {
                            index += 2;
                            break;
                        }
                        index++;
                    }
                    partStart = index;
                }
                break;
            case 44 /* comma */:
                // Ignore trailing commas in object member lists and array element lists
                let nextCode = peekPastWhitespace();
                if (nextCode === 125 /* closeBrace */ || nextCode === 93 /* closeBracket */) {
                    parts.push(text.substring(partStart, index - 1));
                    partStart = index;
                }
                break;
        }
        if (index >= length && index > partStart) {
            parts.push(text.substring(partStart, length));
            break;
        }
    }
    return parts.join('');
}
function tolerantParse(text) {
    text = cleanJsonText(text);
    return JSON.parse(text);
}
exports.tolerantParse = tolerantParse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUE0Q2hHLHFCQUFxQixJQUFZO0lBQzdCLE1BQU0sQ0FBQyxJQUFJLHNCQUFzQjtXQUMxQixJQUFJLDRCQUE0QjtXQUNoQyxJQUFJLHlCQUF5QjtXQUM3QixJQUFJLHNCQUFzQjtXQUMxQixJQUFJLDZCQUEyQjtXQUMvQixJQUFJLGtDQUFnQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxzQkFBc0IsSUFBWTtJQUM5QixNQUFNLENBQUMsSUFBSSxtQkFBbUI7V0FDdkIsSUFBSSxnQkFBaUI7V0FDckIsSUFBSSxzQkFBc0I7V0FDMUIsSUFBSSx5QkFBeUI7V0FDN0IsSUFBSSxzQkFBc0I7V0FDMUIsSUFBSSw0QkFBNEI7V0FDaEMsSUFBSSx1QkFBc0I7V0FDMUIsSUFBSSwrQkFBOEI7V0FDbEMsSUFBSSxxQkFBbUI7V0FDdkIsQ0FBQyxJQUFJLHFCQUFtQixJQUFJLElBQUksNkJBQTJCLENBQUM7V0FDNUQsSUFBSSw2QkFBMkI7V0FDL0IsSUFBSSxrQ0FBZ0M7V0FDcEMsSUFBSSxrQ0FBZ0M7V0FDcEMsSUFBSSxpQ0FBK0I7V0FDbkMsSUFBSSxpQ0FBOEI7V0FDbEMsSUFBSSw4QkFBMkIsQ0FBQztBQUMzQyxDQUFDO0FBRUQsdUJBQXVCLElBQVk7SUFFL0IsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUVsQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBRXpCO1FBQ0ksTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDdEIsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxjQUFjLFNBQWlCLENBQUM7UUFD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