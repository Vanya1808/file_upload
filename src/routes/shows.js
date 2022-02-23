const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

const { Show } = require('../models');

// Створіть змінні для шляхів до папки uploads/thumbnails та public/thumbnails

const uploadDir = path.join(__dirname, '../../uploads/thumbnails')
const publicDir = path.join(__dirname, '../../public/thumbnails')

// Створіть та налаштуйте сховище для multer
// Додайте генерацію унікальної назви файла

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const newFilename = `${new Date().getTime()}_${file.originalname}`;
    cb(null, newFilename)
  },
})

// Створіть мідлвер для завантажень

const upload = multer({
  storage: storage,
})

// Застосуйте мідлвер для обробки одного файла в полі thumbnail
/*
  title: string,
  description: string,
  releasedAt: date,
  thumbnail: file
*/
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    const { path: temporaryName, originalname } = req.file;
    const fileName = path.join(publicDir, originalname)
    try{
      await fs.rename(temporaryName, fileName);
    } catch(err){
      await fs.unlink(temporaryName);
      console.log(err);
      res.status(500).send(err);
    }
    // Перемістіть файл з папки завантажень до папки thumbnails
    const newShow = await Show.create({
      title: req.body.title,
      description: req.body.description,
      releasedAt: req.body.releasedAt,
      thumbnailUrl: req.file.filename, // Назва файлу
    });

    res.json(newShow);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;







