export class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    //Filtering
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const finalQuery = JSON.parse(queryStr);

        Object.keys(finalQuery).forEach(key => {
            if (typeof finalQuery[key] === 'string' && !['startDate', 'endDate', 'status'].includes(key)) {
                finalQuery[key] = { $regex: new RegExp(`^${finalQuery[key]}$`, 'i') };
            }
        });

        this.mongooseQuery = this.mongooseQuery.find(finalQuery);
        return this;
    }

    //Sorting
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('startDate');
        }
        return this;
    }

    //Field Limiting
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    }

    //Pagination
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }

    //Search
    search() {
        if (this.queryString.keyword) {
            const queryStr = this.queryString.keyword;
            this.mongooseQuery = this.mongooseQuery.find({
                title: { $regex: queryStr, $options: 'i' }
            });
        }
        return this;
    }
}