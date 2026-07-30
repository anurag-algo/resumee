const createApiResponse = ({
  success = true,
  statusCode = 200,
  message = "Success",
  data = null,
} = {}) => ({
  success,
  statusCode,
  message,
  data,
});

class ApiResponse {
  constructor({
    success = true,
    statusCode = 200,
    message = "Success",
    data = null,
  } = {}) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse, createApiResponse };
export default createApiResponse;
