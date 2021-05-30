// Is there a better way?
const prefix = "/api/" // adding prefix to the routes.

exports.auth = {
  register: prefix + '/register',
  login: prefix + '/login'
}
