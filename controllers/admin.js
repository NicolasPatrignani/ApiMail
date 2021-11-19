const Product = require('../models/mail');
const Attachment = require('../models/attachment');
const jsonValidator = require('jsonschema').Validator;
const nodemailer = require("nodemailer");
var fs = require("fs");
var ejs = require("ejs");
var path = require("path");
const _ = require('lodash');
const sequelize = require('../util/database');
const {
    result
} = require('lodash');
const { Op } = require("sequelize");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'nicolpatrignani@gmail.com',
        pass: '27843211',
    },
});

exports.getAddMail = (req, res, next) => {
    res.render('admin/edit-mail', {
        pageTitle: 'Add Mail',
        path: '/admin/send',
        editing: false
    });
};

exports.postAddMail = (req, res, next) => {

    var v = new jsonValidator();

    var mailSchema = {
        "id": "/SimpleMail",
        "type": "object",
        "properties": {
            "recipients": {
                "type": "object"
            },
            "subject": {
                "type": "string",
                "minLength": 5
            },
            "message": {
                "type": "string",
                "minLength": 10
            },
            "sender": {
                "type": "string",
                "minLength": 5
            },
            "replyTo": {
                "type": "string",
                "minLength": 5
            },
            "attachments_id": {
                "type": "array",
            },
            "application": {
                "type": "string",
                "minLength": 2
            },
            "priority": {
                "type": "integer",
                "maxLength": 1
            },
            "company": {
                "type": "integer",
                "minLength": 1,
                "maxLength": 2
            },
            "template": {
                "type": "integer"
            }
        },
        "required": [
            "recipients",
            "subject",
            "message",
            "sender",
            "application"
        ]
    };

    var validation = v.validate(req.body, mailSchema);
    console.log(validation.toString())

    if (!validation.valid) {
        res.status(400).end("Invalid body format: " + validation.toString())
    } else {
        const to = req.body.recipients.to.join("; ");
        const cc = req.body.recipients.cc.join("; ");
        const bcc = req.body.recipients.bcc.join("; ");
        const subject = req.body.subject;
        const message = req.body.message;
        const sender = req.body.sender;
        const replyTo = req.body.replyTo;
        const application = req.body.application;
        const priority = req.body.priority;
        const company = req.body.company;
        const template = req.body.template;
        const attachments_id = req.body.attachments_id.join(",");


        Product.create({
                to: to,
                cc: cc,
                bcc: bcc,
                subject: subject,
                message: message,
                sender: sender,
                replyTo: replyTo,
                application: application,
                priority: priority,
                company: company,
                template: template,
                attachments_id: attachments_id
            })
            .then(result => {
                // console.log(result);
                console.log('Created Mail');
                res.status(201).send();
            })
            .catch(err => {
                console.log(err)
                res.status(500).send()
            });
    }
};

exports.getEditMail = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.mailId;
    Product.findByPk(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-mail', {
                pageTitle: 'Edit Mail',
                path: '/admin/edit-mail',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.log(err));
};

exports.postEditMail = (req, res, next) => {
    const prodId = req.body.mailId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    Product.findByPk(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/mails');
        })
        .catch(err => console.log(err));
};

exports.getMails = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('admin/mails', {
                prods: products,
                pageTitle: 'Admin Mails',
                path: '/admin/mails'
            });
        })
        .catch(err => console.log(err));
};

exports.postDeleteMail = (req, res, next) => {
    const prodId = req.body.mailId;
    Product.findByPk(prodId)
        .then(product => {
            return product.destroy();
        })
        .then(result => {
            console.log('DESTROYED MAIL');
            res.redirect('/admin/mails');
        })
        .catch(err => console.log(err));
};

exports.getExecutePriority = (req, res, next) => {
    const priority = req.params.priority
    Product.findAll({
            where: {
                status: null,
                priority: priority,
            }
        })
        .then(
            products => {
                products.forEach(mail => {

                    ejs.renderFile(path.join(__dirname, "../", "/views/mail_template.ejs"), {
                        body: mail.message
                    }, function(err, data) {
                        if (err) {
                            console.log(err);
                            Product.update({
                                status: -1,
                                sendedAt: new Date(),
                                error: err.response,
                                tries: mail.tries + 1
                            }, {
                                where: {
                                    id: mail.id
                                }
                            })
                        } else {
                            var mainOptions = {
                                to: mail.to,
                                subject: mail.subject,
                                html: data
                            };
                            console.log("html data ======================>", mainOptions.html);
                            transporter.sendMail(mainOptions, function(err, info) {
                                if (err) {
                                    console.log(err);
                                    Product.update({
                                        status: -1,
                                        sendedAt: new Date(),
                                        error: err.response,
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    Product.update({
                                        status: 0,
                                        sendedAt: new Date(),
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                }
                            });
                        }

                    });


                })
            }


            /*  products => {
    res.render('admin/execute', {
      prods: products,
      pageTitle: 'Admin Mails',
      path: '/admin/execute'
    });
  } */
        )
        .catch(err => console.log(err));
};

exports.getExecute = (req, res, next) => {
        new Promise(function(resolve, reject) {
         var products = Product.findAll({
            where: {
                status: null
            },
            order: [
                'priority'
            ]
        })

          resolve(products)
        
        })
        .then( (products) => {
            return new Promise(function(resolve, reject) {
            products.forEach(mail => {
                mail.attachments = [Attachment.findAll({
                    where: {
                        id: mail.attachments_id
                    },
                    attributes: ['path', 'filename']
                })]
            })
            resolve(products)
        })
        })
        .then((products) => {
                products.forEach(mail => {
                    console.log(mail);
                    ejs.renderFile(path.join(__dirname, "../", "/views/mail_template.ejs"), {
                        body: mail.message
                    }, function(err, data) {
                        if (err) {
                            Product.update({
                                status: -1,
                                sendedAt: new Date(),
                                error: err.response,
                                tries: mail.tries + 1
                            }, {
                                where: {
                                    id: mail.id
                                }
                            })
                        } else {
                            var mainOptions = {
                                to: mail.to,
                                subject: mail.subject,
                                html: data,
                                attachments: mail.attachments

                            };
                           /*  console.log(mainOptions); */
                            /* transporter.sendMail(mainOptions, function (err, info) {
                                if (err) {
                                    console.log(err);       
                                    Product.update({status: -1, sendedAt: new Date(), error: err.response, tries: mail.tries+1}, {
                                      where: {
                                        id: mail.id
                                      }})               
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    console.log('Priority: ' + mail.priority);       
                                    Product.update({status: 0, sendedAt: new Date(), tries: mail.tries+1}, {
                                      where: {
                                        id: mail.id
                                      }
                                    })                 
                                }
                            }); */

                        }

                    });
                })
            }
        )
        .catch(err => console.log(err));
};

exports.getRetry = (req, res, next) => {
    const id = req.params.mailId
    Product.findAll({
            where: {
                id: id,
            }
        })
        .then(
            products => {
                products.forEach(mail => {

                    ejs.renderFile(path.join(__dirname, "../", "/views/mail_template.ejs"), {
                        body: mail.message
                    }, function(err, data) {
                        if (err) {
                            console.log(err);
                            Product.update({
                                status: -1,
                                sendedAt: new Date(),
                                error: err.response,
                                tries: mail.tries + 1
                            }, {
                                where: {
                                    id: mail.id
                                }
                            })
                        } else {
                            var mainOptions = {
                                to: mail.to,
                                subject: mail.subject,
                                html: data
                            };
                            console.log("html data ======================>", mainOptions.html);
                            transporter.sendMail(mainOptions, function(err, info) {
                                if (err) {
                                    console.log(err);
                                    Product.update({
                                        status: -1,
                                        sendedAt: new Date(),
                                        error: err.response,
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    Product.update({
                                        status: 0,
                                        sendedAt: new Date(),
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                }
                            });
                        }

                    });


                })
            }


            /*  products => {
    res.render('admin/execute', {
      prods: products,
      pageTitle: 'Admin Mails',
      path: '/admin/execute'
    });
  } */
        )
        .catch(err => console.log(err));
};

exports.getRetryAll = (req, res, next) => {
    Product.findAll({
            where: {
                status: -1
            },
            order: [
                'priority'
            ],
        })
        .then(
            products => {
                products.forEach(mail => {

                    ejs.renderFile(path.join(__dirname, "../", "/views/mail_template.ejs"), {
                        body: mail.message
                    }, function(err, data) {
                        if (err) {
                            Product.update({
                                status: -1,
                                sendedAt: new Date(),
                                error: err.response,
                                tries: mail.tries + 1
                            }, {
                                where: {
                                    id: mail.id
                                }
                            })
                        } else {
                            var mainOptions = {
                                to: mail.to,
                                subject: mail.subject,
                                html: data
                            };
                            console.log("html data ======================>", mainOptions.html);
                            transporter.sendMail(mainOptions, function(err, info) {
                                if (err) {
                                    console.log(err);
                                    Product.update({
                                        status: -1,
                                        sendedAt: new Date(),
                                        error: err.response,
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    console.log('Priority: ' + mail.priority);
                                    Product.update({
                                        status: 0,
                                        sendedAt: new Date(),
                                        tries: mail.tries + 1
                                    }, {
                                        where: {
                                            id: mail.id
                                        }
                                    })
                                }
                            });

                        }

                    });
                })
            }
            /*   products => {
              res.render('admin/execute', {
                prods: products,
                pageTitle: 'Admin Mails',
                path: '/admin/execute'
              });
            } */
        )
        .catch(err => console.log(err));
};

exports.postUploadAttacments = postUploadAttacments;

async function postUploadAttacments(req, res, next) {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {

            function procesarCarga(req, key) {
                return new Promise(function(resolve, reject) {
                    let attachment = req.files.attachments[key];
                    var now = Date.now();
                    var uniqueFileName = now + '_' + attachment.name;
                    //move photo to uploads directory
                    attachment.mv('./attachments/' + uniqueFileName);
                    var test = Attachment.create({
                        filename: attachment.name,
                        uniqueFileName: uniqueFileName + '_' + attachment.name,
                        path: 'attachments/' + uniqueFileName,
                        mimetype: attachment.mimetype,
                        application: req.body.application
                    }).then(
                        async function(result) {
                            return {
                                id: result.id,
                                name: attachment.name,
                                uniqueFileName: uniqueFileName,
                                mimetype: attachment.mimetype,
                                size: attachment.size,
                                application: req.body.application,
                                path: 'attachments/' + uniqueFileName,
                                timestamp: result.createdAt,
                            }
                        }
                    )

                    test.then(async function(result) {
                        resolve(result)
                    })
                });
            }

            async function cargar(req, key, size) {
                let result = await procesarCarga(req, key);
                data.push(result)
                if (data.length == size) {
                    res.status(201).send({
                        status: true,
                        message: 'Files are uploaded',
                        data: data
                    });
                }
            }

            var data = [];
            _.forEach(_.keysIn(req.files.attachments), (key) => {
                cargar(req, key, req.files.attachments.length);
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
};