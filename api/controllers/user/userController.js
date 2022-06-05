"use strict";
function UserController() {
  return {
    /** @memberOf ServiceManagerController
     * @description List all building
     * @param req
     * @param res
     * @returns {Promise<any>}
     */
    list: (req, res) => {},
    update: (req, res) => {},
  };
}

module.exports = new UserController();