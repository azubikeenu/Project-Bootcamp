module.exports = class QueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const santizedFields = Object.keys(this.queryString).filter(
      (el) => !excludedFields.includes(el)
    );
    const queryObject = santizedFields.reduce((acc, curr) => {
      acc[curr] = this.queryString[curr];
      return acc;
    }, {});
    const regex = /\b(gte|gt|lte|lt|ne|in|nin)\b/g;
    let queryStr = JSON.stringify(queryObject);
    queryStr = JSON.parse(queryStr.replace(regex, (match) => `$${match}`));
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  select() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
