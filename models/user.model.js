const db = require("../utils/db");
const nodemailer = require("nodemailer");

const TABLE_NAME = "user";
const PRIMARY_KEY = "user_id";
const ADMIN = "admin";
const STUDENT = "student";
const TEACHER = "teacher";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC";

module.exports = {
  async all() {
    return await db("user");
  },

  add(user) {
    return db("user").insert(user);
  },

  async getByEmail(email) {
    const users = await db("user").where("email", email);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async getByEmailUpdate(username, email) {
    const users = await db("user")
      .where("email", email)
      .where("username", "!=", username);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async getByPhone(phone) {
    const users = await db("user").where("phone_number", phone);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async singleByUserName(username) {
    const users = await db("user")
      .where("username", username)
      .where("is_delete", 0);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async singleByUserId(userId) {
    const users = await db("user")
      .where("user_id", userId)
      .where("is_delete", 0);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  patchRFToken(id, rfToken) {
    return db("user").where("user_id", id).update("refresh_token", rfToken);
  },

  async isValidRFToken(id, rfToken) {
    const list = await db("user")
      .where("user_id", id)
      .andWhere("refresh_token", rfToken)
      .first();

    if (list) {
      return true;
    }

    return false;
  },

  async verifyEmail(userId, code) {
    return db("user")
      .where("user_id", userId)
      .where("code", code)
      .update("is_verify", 1);
  },

  async updateProfile(username, name, email) {
    return db("user")
      .where("username", username)
      .update("name", name)
      .update("email", email);
  },

  async changePassword(username, password) {
    return db("user").where("username", username).update("password", password);
  },

  async registerAcademy(username, listAcademy) {
    let user = await this.singleByUserName(username);

    for (let i = 0; i < listAcademy.length; i++) {
      let academy = await db("academy")
        .where("academy_id", listAcademy[i].academy_id)
        .where("is_delete", 0)
        .first();
      if (!academy) {
        return academy;
      }

      let isRegisterAcademy = await db("academy_register_like")
        .where("student_id", user.user_id)
        .where("academy_id", listAcademy[i].academy_id)
        .where("is_register", 1)
        .first();

      if (isRegisterAcademy) {
        return "registered_" + academy.academy_name;
      }
    }

    var t = await db.transaction();
    try {
      for (let i = 0; i < listAcademy.length; i++) {
        await db("academy_register_like").insert({
          student_id: user.user_id,
          academy_id: listAcademy[i].academy_id,
          is_register: 1,
        });

        await db("academy")
          .where("academy_id", listAcademy[i].academy_id)
          .update({ register: db.raw("?? + 1", ["register"]) });
      }

      return true;
    } catch (error) {
      console.log(error);
      t.rollback();
    }
  },

  async sendConfirmMail(username) {
    let user = await this.singleByUserName(username);

    var smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bmt.nhox1999@gmail.com",
        pass: "vanhoa00",
      },
    });
    var mailOptions = {
      from: "bmt.nhox1999@gmail.com",
      to: user.email,
      subject: "Confirm email",
      html: `
        <!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Simple Transactional Email</title>
    <style>
      /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%; }
      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0; 
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%; }
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%; }
        table td {
          font-family: sans-serif;
          font-size: 14px;
          vertical-align: top; }
      /* -------------------------------------
          BODY & CONTAINER
      ------------------------------------- */
      .body {
        background-color: #f6f6f6;
        width: 100%; }
      /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
      .container {
        display: block;
        Margin: 0 auto !important;
        /* makes it centered */
        max-width: 580px;
        padding: 10px;
        width: 580px; }
      /* This should also be a block element, so that it will fill 100% of the .container */
      .content {
        box-sizing: border-box;
        display: block;
        Margin: 0 auto;
        max-width: 580px;
        padding: 10px; }
      /* -------------------------------------
          HEADER, FOOTER, MAIN
      ------------------------------------- */
      .main {
        background: #fff;
        border-radius: 3px;
        width: 100%; }
      .wrapper {
        box-sizing: border-box;
        padding: 20px; }
      .footer {
        clear: both;
        padding-top: 10px;
        text-align: center;
        width: 100%; }
        .footer td,
        .footer p,
        .footer span,
        .footer a {
          color: #999999;
          font-size: 12px;
          text-align: center; }
      /* -------------------------------------
          TYPOGRAPHY
      ------------------------------------- */
      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        Margin-bottom: 30px; }
      h1 {
        font-size: 35px;
        font-weight: 300;
        text-align: center;
        text-transform: capitalize; }
      p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        Margin-bottom: 15px; }
        p li,
        ul li,
        ol li {
          list-style-position: inside;
          margin-left: 5px; }
      a {
        color: #3498db;
        text-decoration: underline; }
      /* -------------------------------------
          BUTTONS
      ------------------------------------- */
      .btn {
        box-sizing: border-box;
        width: 100%; }
        .btn > tbody > tr > td {
          padding-bottom: 15px; }
        .btn table {
          width: auto; }
        .btn table td {
          background-color: #ffffff;
          border-radius: 5px;
          text-align: center; }
        .btn a {
          background-color: #ffffff;
          border: solid 1px #3498db;
          border-radius: 5px;
          box-sizing: border-box;
          color: #3498db;
          cursor: pointer;
          display: inline-block;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          padding: 12px 25px;
          text-decoration: none;
          text-transform: capitalize; }
      .btn-primary table td {
        background-color: #3498db; }
      .btn-primary a {
        background-color: #3498db;
        border-color: #3498db;
        color: #ffffff; }
      /* -------------------------------------
          OTHER STYLES THAT MIGHT BE USEFUL
      ------------------------------------- */
      .last {
        margin-bottom: 0; }
      .first {
        margin-top: 0; }
      .align-center {
        text-align: center; }
      .align-right {
        text-align: right; }
      .align-left {
        text-align: left; }
      .clear {
        clear: both; }
      .mt0 {
        margin-top: 0; }
      .mb0 {
        margin-bottom: 0; }
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0; }
      .powered-by a {
        text-decoration: none; }
      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        Margin: 20px 0; }
      /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      @media only screen and (max-width: 620px) {
        table[class=body] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important; }
        table[class=body] p,
        table[class=body] ul,
        table[class=body] ol,
        table[class=body] td,
        table[class=body] span,
        table[class=body] a {
          font-size: 16px !important; }
        table[class=body] .wrapper,
        table[class=body] .article {
          padding: 10px !important; }
        table[class=body] .content {
          padding: 0 !important; }
        table[class=body] .container {
          padding: 0 !important;
          width: 100% !important; }
        table[class=body] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important; }
        table[class=body] .btn table {
          width: 100% !important; }
        table[class=body] .btn a {
          width: 100% !important; }
        table[class=body] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important; }}
      @media all {
        .ExternalClass {
          width: 100%; }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%; }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important; } 
        .btn-primary table td:hover {
          background-color: #34495e !important; }
        .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important; } }
    </style>
  </head>
  <body class="">
    <table border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
            <span class="preheader">Subscribe to Coloured.com.ng mailing list</span>
            <table class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1>Confirm your email</h1>
                        <h2>You are just one step away</h2>
                        <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="left">
                                <table border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a href="http://localhost:3000/verify/${user.user_id}/${user.code}" target="_blank">confirm email</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p>If you received this email by mistake, simply delete it. You won't be subscribed if you don't click the confirmation link above.</p>
      
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">Coloured.com.ng | Feminism | Culture | Law | Feminists Rising</span>
                    <br> Don't like these emails? <a href="#">Unsubscribe</a>.
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    Powered by <a href="https://fb.me/jalasem">Jalasem</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
            
          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>`,
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        res.redirect("/");
      }
    });
  },

  // ================================== TEACHER ====================================
  // lấy tất cả giáo viên, học viên
  async getAllUser(page = 1, limit = LIMIT, sort = SORT_TYPE, role = TEACHER) {
    const listTeacher = await db(TABLE_NAME)
      .where("role", role)
      .where("is_delete", NOT_DELETE)
      .orderBy(`${PRIMARY_KEY}`, sort)
      .limit(limit)
      .offset((page - 1) * limit);

    if (listTeacher.length <= 0) {
      return null;
    }
    return listTeacher;
  },

  // chi tiết giáo viên
  async getDetailUser(id) {
    const item = await db(TABLE_NAME)
      .where(PRIMARY_KEY, id)
      .where("is_delete", NOT_DELETE);

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },

  // thêm giáo viên
  addTeacher(user) {
    return db(TABLE_NAME).insert(user);
  },

  // chỉnh sửa giáo viên
  async editTeacherById(id, data) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(data);
  },

  // chỉnh sửa giáo viên
  async changePasswordUser(id, data) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ password: data });
  },

  // xoá giáo viên, học viên
  deleteUser(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },
  // ================================ END TEACHER ==================================
};
