import type { Query } from 'mongoose';

type QueryString = {
    [key: string]: string | undefined;
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;
    keyword?: string;
    startDateFrom?: string;
    startDateTo?: string;
};

export class ApiFeatures<
    TResult,
    TDoc,
    THelpers = {},
    TRawDocType = unknown
> {
    private mongooseQuery: Query<TResult, TDoc, THelpers, TRawDocType>;
    private queryString: QueryString;

    constructor(
        mongooseQuery: Query<TResult, TDoc, THelpers, TRawDocType>,
        queryString: QueryString
    ) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    getQuery(): Query<TResult, TDoc, THelpers, TRawDocType> {
        return this.mongooseQuery;
    }

    filter(): this {
        const queryObj = { ...this.queryString };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
            'keyword',
            'startDateFrom',
            'startDateTo'
        ];
        excludedFields.forEach(field => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const finalQuery = JSON.parse(queryStr);

        Object.keys(finalQuery).forEach(key => {
            if (typeof finalQuery[key] === 'string' && !['startDate', 'status'].includes(key)) {
                finalQuery[key] = {
                    $regex: new RegExp(`^${finalQuery[key]}$`, 'i')
                };
            }
        });

        const startDate: { $gte?: Date; $lte?: Date } = {};

        if (this.queryString.startDateFrom) {
            startDate.$gte = new Date(this.queryString.startDateFrom);
        }

        if (this.queryString.startDateTo) {
            startDate.$lte = new Date(this.queryString.startDateTo);
        }

        if (Object.keys(startDate).length > 0) {
            finalQuery.startDate = startDate;
        }

        this.mongooseQuery.find(finalQuery);
        return this;
    }

    sort(): this {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery.sort('startDate');
        }

        return this;
    }

    limitFields(): this {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery.select('-__v');
        }

        return this;
    }

    paginate(): this {
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 10;
        const skip = (page - 1) * limit;

        this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }

    search(): this {
        if (this.queryString.keyword) {
            this.mongooseQuery.find({
                title: { $regex: this.queryString.keyword, $options: 'i' }
            });
        }

        return this;
    }
}