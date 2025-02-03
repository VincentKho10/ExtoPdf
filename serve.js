const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const ejs = require("ejs");

const { parse } = require("csv-parse/sync");
const { create } = require("domain");

const templatePath = path.join(
  __dirname,
  "views/checklist_pengiriman",
  "index.ejs"
);

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

app.get("/generate", (req, res) => {
  (async () => {
    res.render(templatePath, {
      no_pengiriman: "12134221",
      tgl_pengiriman: "11/2/24",
      nama_pelanggan: "ASIAN ISUZU CASTING CENTER PT.",
    });
  })();
});

app.get("/", (req, res) => {
  res.render("user_interface");
});

const cpam3Path = "uploads/result/checklist_pengiriman/am3"
const cpstmaPath = "uploads/result/checklist_pengiriman/sutema"
const kpkndraPath = "uploads/result/kelengkapan_kendaraan"

const createPdf = async (element,target) => {
  try {
    // const element = records[0]
    const html = await ejs.renderFile(templatePath, element);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const filename = `${element.nama_pelanggan
      .replaceAll(/[^\w\s]/g, "")
      .replaceAll(" ", "_")}-${element.no_pengiriman.replaceAll(
      /[^\w\s]/g,
      "_"
    )}`;

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfPath = path.join(
      __dirname,
      target=="am3"?"uploads/result/checklist_pengiriman/am3":"uploads/result/checklist_pengiriman/sutema",
      `${filename}.pdf`
    );

    await page.pdf({
      path: pdfPath,
      format: "A4",
    });

    console.log(`PDF generated for ${filename}: ${pdfPath}`);

    await browser.close();
  } catch (error) {
    console.error("Error rendering Ejs template:", error);
  }
};

app.post("/generate/checklist_pengiriman", uploadstor.single("file"), (req, res, next) => {
  
  const { target } = req.body;

  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  } else {
    if (!fs.existsSync("uploads/result")) {
      fs.mkdirSync("uploads/result");
    }
    if (!fs.existsSync("uploads/input")) {
      fs.mkdirSync("uploads/input");
    }
    if (!fs.existsSync("uploads/result/checklist_pengiriman")) {
      fs.mkdirSync("uploads/result/checklist_pengiriman");
    }
    if (!fs.existsSync(cpam3Path)) {
      fs.mkdirSync(cpam3Path);
    }
    if (!fs.existsSync(cpstmaPath)) {
      fs.mkdirSync(cpstmaPath);
    }
    if (!fs.existsSync(kpkndraPath)) {
      fs.mkdirSync(kpkndraPath);
    }
  }

  let records = parse(req.file.buffer.toString("utf-8"), {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
  });

  if (!req.file) {
    return res.status(400).json({ message: "file not found" });
  }

  // console.log(records)

  records = records.map((v) => {
    return {
      no_pengiriman: v["No. Pengiriman"],
      tgl_pengiriman: v["Tgl. Pengiriman"],
      nama_pelanggan: v["Nama Pelanggan"],
    };
  });

  (async () => {
    const batchz = 5;

    for (let i = 0; i < records.length; i += batchz) {
      const tocvt = records.slice(i, i + batchz);
      await Promise.all(tocvt.map((v) => createPdf(v,target)));
    }
  })();

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
