import { Entities, Entity } from 'type-arango';
import { db } from 'type-arango/dist/utils';
import { QueryOpt } from 'type-arango/dist/types';

import { flatten, unflatten } from 'flat';

export class CsvImportExport {
    col: typeof Entities;
    doc: typeof Entity;

    constructor(col: typeof Entities, doc: typeof Entity) {
        this.col = col;
        this.doc = doc;
    }

    toCsv(options: QueryOpt = {}): string {
        // TODO: Sort by numerical order instead of alphabetical
        // Sort by key (default)
        if (!options.sort) options.sort = ['_key ASC'];

        let data = this.col.find(options);

        if (data.length == 0) return '';

        data = data.map((doc) => flatten(doc, { safe: true }));
        const headersSet = new Set<string>();
        data.forEach((doc) => {
            Object.keys(doc).forEach((header) => headersSet.add(header));
        });
        const headers = Array.from(headersSet.values());
        let csv = headers.join(',');
        data.forEach((doc) => {
            csv +=
                '\n' +
                headers
                    .map((field) => CsvImportExport.valueToCsv(doc[field]))
                    .join(',');
        });

        return csv;
    }

    fromCsv(
        csv: string,
        // TODO: Implement validation
        validate: (doc: any) => boolean = () => true,
    ): Readonly<Entity>[] {
        if (csv.length == 0) return [];

        const [headerRow, ...rows] = csv.split('\n');

        const headers = headerRow.split(',');

        let data: any[] = [];
        rows.forEach((row) => {
            if (row == '') return;

            // TODO: Improve row splitting
            let obj = row.split(',').reduce(
                (object, value, index) => ({
                    ...object,
                    [headers[index]]: CsvImportExport.valueFromCsv(value),
                }),
                {},
            );
            obj = unflatten(obj, { safe: true });
            data.push(obj);
        });

        // TODO: Check for errors
        db._executeTransaction({
            collections: { write: this.col._col.name },
            params: data,
            action: (data: any[]) => {
                data.map((doc) => {
                    if (!validate(doc))
                        throw Error(
                            'Validation failed for ' + JSON.stringify(doc),
                        );
                    if (doc._key) {
                        const found = this.col.findOne(doc._key);
                        if (found) {
                            found.merge(doc);
                            return found;
                        }
                    }
                    return new this.doc(doc);
                }).forEach((doc) => doc.save());
            },
        });
        return data;
    }

    private static valueToCsv(value: any): string {
        if (value === null) return '';
        if (typeof value === 'object' || typeof value === 'string')
            return JSON.stringify(value);
        return value.toString();
    }

    private static valueFromCsv(value: string): any {
        if (value == '') return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            throw Error(`Could not parse value from CSV: '${value}'`);
        }
    }
}
