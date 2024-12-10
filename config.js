import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import sessions from "express-session";
import bbz307 from "bbz307";
import path from "path"; // Importiere path für den Dateipfad

export function createApp(dbconfig) {
  const app = express();

  const pool = new Pool(dbconfig);

  const login = new bbz307.Login("users", ["username", "password"], pool);

  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // jhkhkj
  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  /*LOGIN*/
  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/start");
      return;
    }
  });

  /*REGISTRIEUNG*/
  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });

  /*Intern*/
  app.get("/start", (req, res) => {
    res.render("start");
  });

  app.get("/", async function (req, res) {
    const posts = await app.locals.pool.query("select * from posts");
    res.render("start", { posts: posts.rows });
  });

  /*Formular ohne Dateiupload*/
  app.get("/posts_formular", function (req, res) {
    res.render("posts_formular");
  });

  app.post("/posts", upload.single("headerfoto"), async function (req, res) {
    const user = await login.loggedInUser(req);
    await pool.query(
      "INSERT INTO posts_formular (title, description, image_url, user_id) VALUES ($1, $2, $3, $4)",
      [
        req.body.title,
        req.body.description,
        req.body.place,
        req.file.filename,
        user.id,
      ]
    );
    res.redirect("/");
  });

  // Login-Prozess
  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/start");
      return;
    }
  });

  // Registrierung-Prozess
  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });

  app.get("/intern", async function (req, res) {
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    const posts = await pool.query("SELECT * FROM posts");
    res.render("intern", { user: user, posts: posts.rows });
  });

  app.post("/posts", upload.single("headerfoto"), async function (req, res) {
    const user = await login.loggedInUser(req);

    // Post-Daten in die Datenbank einfügen
    await pool.query(
      "INSERT INTO posts (title, description, place, image_url, user_id) VALUES ($1, $2, $3, $4, $5)",
      [
        req.body.title,
        req.body.description,
        req.body.place,
        req.file.filename, // Name der hochgeladenen Datei
        user.id, // User-ID aus der Sitzung
      ]
    );

    res.redirect("/"); // Nach dem Absenden zurück zur Startseite
  });

  // Route, die alle Posts von allen Benutzern abruft
  app.get("/", async function (req, res) {
    try {
      // Alle Posts aus der Datenbank abfragen
      const posts = await app.locals.pool.query(
        "SELECT * FROM posts ORDER BY created_at DESC"
      );

      // Alle Posts an die Startseite übergeben
      res.render("start", { posts: posts.rows });
    } catch (err) {
      console.error(err);
      res.status(500).send("Fehler beim Laden der Posts");
    }
  });

  /*Profile*/
  app.get("/profile", async function (req, res) {
    res.render("profile");
  });

  app.locals.pool = pool;

  return app;
}

export { upload };
