// abstraction / abtract class
const ValidationError = require("../helpers/errors/validation");
const validation = require("../middlewares/validation");
const { Prisma } = require("@prisma/client");

class BaseController {
  constructor(model) {
    this.model = model;
    this.validation = validation;
  }

  getAll = async (req, res, next) => {
    try {
      const {
        sortBy = "createdDt",
        sort = "desc",
        page = 1,
        limit = 10,
      } = req.query;

      const { resources, count } = await this.model.get({
        q: {
          sortBy,
          sort,
          page,
          limit,
        },
      });

      return res.status(200).json(
        this.apiSend({
          code: 200,
          status: "success",
          message: "Data fetched successfully",
          data: resources,
          pagination: {
            page,
            limit,
            totalPage: Math.ceil(count / limit),
            total: count,
          },
        })
      );
    } catch (err) {
      next(new ServerError(err));
    }
  };

  get = async (req, res, next) => {
    try {
      const { id } = req.params;
      const resource = await this.model.getById(id);
      if (!resource) {
        return next(new NotFoundError(`cars ${id} not found`, "Data not found"))
      }
      return res.status(200).json(
        this.apiSend({
          status: "success",
          message: "Data fetched successfully",
          data: resource,
        })
      );
    } catch (err) {
      next(new ServerError(err));
    }
  };

  create = async (req, res, next) => {
    try {
      const data = {
        ...req.body,
        createdBy: req.user.fullname,
        updatedBy: req.user.fullname
      }
      const resource = await this.model.set(data);

      return res.status(201).json(
        this.apiSend({
          status: "success",
          message: "Data created successfully",
          data: resource,
        })
      );
    } catch (err) {
      next(new ServerError(err));
    }
  };

  update = async (req, res, next) => {
    const { id } = req.params;
    try {
      const data = {
        ...req.body,
        createdBy: req.user.fullname,
        updatedBy: req.user.fullname
      }
      const resource = await this.model.update(id, data);

      return res.status(200).json(
        this.apiSend({
          status: "success",
          message: "Data updated successfully",
          data: resource,
        })
      );
    } catch (err) {
      //handle prisma not found error
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return next(new NotFoundError(err, `Car with id=${id} not found!`));
        }
      }

      next(new ServerError(err));
    }
  };

  delete = async (req, res, next) => {
    const { id } = req.params;
    try {
      const resource = await this.model.delete(id);

      return res.status(200).json(
        this.apiSend({
          status: "success",
          message: `Data with id ${id} deleted successfully`,
          data: resource,
        })
      );
    } catch (err) {
      //handle prisma not found error
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return next(new NotFoundError(err, `Car with id=${id} not found!`));
        }
      }
      next(new ServerError(err));
    }
  };

  apiSend({ code, status, message, data, pagination }) {
    return {
      code,
      status,
      message,
      data,
      ...(pagination && pagination),
    };
  }
}

module.exports = BaseController;
