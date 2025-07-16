import express from "express";
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import  multer  from "multer";
//handles path of files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static("public"));

const upload = multer({
  dest: "public/uploads/",
  //sets size to 5mb
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or GIF images are allowed"));
    }
    cb(null, true);
  }
});

let posts = [];
app.get("/", (req, res) => {
   res.render("index.ejs", {posts : posts})
});

app.get("/compose", (req, res) => {
   res.render("compose.ejs")
});

app.post("/compose", upload.array("images", 5), (req, res) => {
       const post = {
        title : req.body.postTitle,
        content : req.body.postContent,
        images: req.files.map(file => `/uploads/${file.filename}`)
    }
    posts.push(post);
   res.redirect("/")
});


app.get("/posts", (req, res) => {
  res.render("posts.ejs", { posts });
});

app.get("/post/:postTitle", (req, res) => {
    const requestedTitle = req.params.postTitle.toLowerCase();
    const post = posts.find(p => p.title.toLowerCase() === requestedTitle);
    if(post){
     res.render("post.ejs", {
        title : post.postTitle,
        content : post.postContent,
        images: post.images || [] 
     });
    }else{
        res.send("Post not found")
    }
   
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { submitted: false });
});


app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  res.render("contact.ejs", {
    submitted: true,
    name,
    email,
    message
  });
});


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})