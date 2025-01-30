const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const ejs = require("ejs");

const { parse } = require("csv-parse/sync");

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["text/csv"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File is not supported"), false);
  }
};

const uploadstor = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
});

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  res.render("user_interface");
});

app.post("/generate", uploadstor.single("file"), (req, res, next) => {
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  let records = parse(req.file.buffer.toString("utf-8"), {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
  });

  if (!req.file) {
    return res.status(400).json({ message: "file not found" });
  }

  const templatePath = path.join(
    __dirname,
    "views/checklist_pengiriman",
    "index.ejs"
  );

  // console.log(records)

  records = records.map((v) => {
    return {
      no_pengiriman: v["No. PO"],
      tgl_pengiriman: v["Tgl. Pengiriman"],
      nama_pelanggan: v["Nama Pelanggan"],
    };
  });

  records.forEach((element) => {
    ejs.renderFile(templatePath, element, async (err, html) => {
      if (err) {
        console.error("Error rendering Ejs template:", err);
        return;
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setContent(html, {waitUntil: 'networkidle0'})

      records.forEach(async element => {
        const pdfPath = path.join(__dirname, 'uploads/result', `${element["Nama Pelanggan"]}${element["No. PO"]}${element["Tgl. Pengiriman"]}.pdf`)
        await page.pdf({
          path: pdfPath,
          format: 'A4',
        })

        console.log(`PDF generated for ${element["Nama Pelanggan"]}${element["No. PO"]}${element["Tgl. Pengiriman"]}: ${pdfPath}`)
      });
    });
  });

  res.status(200).json({ message: "file uploaded successfully" });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send({ message: "Multer error: " + err.message });
  }
  if (err) {
    return res.status(400).send({ message: err.message });
  }
  next();
});

app.listen(3000, "localhost", () => {
  console.log("listening to http://localhost:3000");
});
