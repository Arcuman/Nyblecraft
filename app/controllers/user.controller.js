const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const multiparty = require('multiparty');
const PDFDocument = require('pdfkit');
const fs = require("fs");
const path = require("path")


exports.create = (req, res) => {
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {

        if (!fields.firstName || !fields.lastName || !files.image) {
            res.status(400).send({
                message: "FirstName, LastName, Image are required!"
            });
            return;
        }
        const firstName = fields.firstName[0];
        const lastName = fields.lastName[0];
        const filePath = files.image[0].path;

        const user = {
            firstName: firstName,
            lastName: lastName,
            image: fs.readFileSync(filePath),
        };

        User.create(user)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the User."
                });
            });
    });

};

exports.findAll = (req, res) => {
    const firstName = req.query.firstName;
    const condition = firstName ? {firstName: {[Op.like]: `%${firstName}%`}} : null;

    User.findAll({where: condition})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
};

exports.findImage = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then(data => {
            res.setHeader("Content-Type", "image/png");
            res.send(data.image);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving User Image with id=" + id
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    User.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving User with id=" + id
            });
        });
};

exports.createPDF = async (req, res) => {
    const firstName = req.body.firstName;
    if (!firstName) {
        res.status(400).send({
            message: "FirstName is required!"
        });
        return;
    }
    const userData = await User.findOne({where: {firstName: firstName}})
    if (!userData) {
        res.status(400).send({
            message: `Cannot create PDF User with name = ${firstName}. Maybe User was not found!`
        });
        return;
    }
    const doc = new PDFDocument;
    const pathPDF = path.resolve('./resources/static/assets/tempPDF/', Date.now() + '.pdf');
    const stream = doc.pipe(fs.createWriteStream(pathPDF));
    doc.text(`First Name: ${userData.firstName}`);
    doc.text(`Last Name: ${userData.lastName}`);
    doc.image(userData.image);
    doc.save();
    doc.end();
    let newPdf;
    stream.on('finish', async () => {
        newPdf = fs.readFileSync(pathPDF);

        const num = await User.update({pdf: newPdf}, {
            where: {
                firstName: userData.firstName,
            }
        })
        fs.unlinkSync(pathPDF);
        if (num[0] !== 0) {
            response = { 'isExists': true }
            res.send(response);
        } else {
            response = { 'isExists': false }
            res.send(response);
        }
    });
}
