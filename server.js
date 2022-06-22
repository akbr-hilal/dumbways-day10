const express = require("express");
const db = require("./database/db");
const app = express();
const port = 5000;

app.set("view engine", "hbs"); //Set hbs
app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: false }));

let isLogin = true;
db.connect(function (err, client, done) {
    if (err) throw err

    app.get("/", function (req, res) {
        client.query("SELECT * FROM tb_project", function (err, result) {
            if (err) throw err;

            let data = result.rows;
            let dataProject = data.map(function (items) {
                return {
                    ...items,
                    start_date: getFullTime(items.start_date),
                    end_date: getFullTime(items.end_date),
                    duration: getDistanceTime(
                        new Date(items.start_date),
                        new Date(items.end_date)
                    ),
                    isLogin,
                };
            });
            console.log(dataProject);
            res.render("index", { isLogin, projects: dataProject });
        });
    
    });

    app.get("/del-project/:id", function (req, res) {
        let delQuery = `DELETE FROM tb_project WHERE id = ${req.params.id}`;

        client.query(delQuery, function (err, result) {
            if (err) throw err;

            res.redirect("/");
        });
        done;
    });

    app.get("/edit-project/:id", function (req, res) {
        let id = req.params.id;
        console.log(id);

        client.query(`SELECT * FROM tb_project WHERE id=${id}`, function (err, result){
            if (err) throw err

            let data = result.rows[0]
            data = {
                title: data.title,
                image: data.image,
                start_date: data.start_date,
                end_date: data.end_date,
                nodeJs: data.technologis[0],
                reactJs: data.technologis[1],
                angularJs: data.technologis[2],
                laravel: data.technologis[3],
                description: data.description,
            };


            res.render("edit-project", { data, name: id });
        })

    });

    app.post("/edit-project/:id", function (req, res) {
        let id = req.params.id;
        let data = req.body;
        dataProject[id] = data;

        let updateData = `UPDATE tb_project
        SET title='${dataProject[id].titleProject}', start_date='${dataProject[id].startDateProject}', end_date='${dataProject[id].endDateProject}', description='${dataProject[id].descriptionProject}', technologis='{"${dataProject[id].checkNodeJS}","${dataProject[id].checkReactJS}","${dataProject[id].checkAngularJS}","${dataProject[id].checkLaravel}"}', image='${dataProject[id].imageProject}'
        WHERE id=${id}`;

        client.query(updateData, (err, result) => {
            if (err) throw err;
            res.redirect("/");
        });
        done;
    });

    app.get("/add-project", function (req, res) {
        res.render("add-project");
    });

    app.post("/add-project", function (req, res) {
        let data = req.body;

        let insertData = `INSERT INTO tb_project(title, start_date, end_date, description, technologis, image) VALUES ('${data.titleProject}', '${data.startDateProject}', '${data.endDateProject}', '${data.descriptionProject}', '{"${data.checkNodeJS}", "${data.checkReactJS}", "${data.checkAngularJS}", "${data.checkLaravel}"}', '${data.imageProject}')`;

        client.query(insertData, (err, result) => {
            if (err) throw err;
            res.redirect("/");
        });
        done;
    });

    app.get("/project-detail/:id", function (req, res) {
        let id = req.params.id;

        client.query(
            `SELECT * FROM tb_project WHERE id=${id}`,
            function (err, result) {
                if (err) throw err;

                let data = result.rows[0];

                data = {
                    title: data.title,
                    image: data.image,
                    start_date: getFullTime(data.start_date),
                    end_date: getFullTime(data.end_date),
                    duration: getDistanceTime(
                        new Date(data.start_date),
                        new Date(data.end_date)
                    ),
                    nodeJs: data.technologis[0],
                    reactJs: data.technologis[1],
                    angularJs: data.technologis[2],
                    laravel: data.technologis[3],
                    description: data.description,
                };
                console.log(data)
                res.render("project-detail", data);
            }
        );
    });

    app.get("/contact", function (req, res) {
        res.render("contact");
    });

})

function getFullTime(waktu) {
    let month = [
        "Januari",
        "Febuari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    let date = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
    ];

    let dateIndex = waktu.getDate();
    let monthIndex = waktu.getMonth();
    let year = waktu.getFullYear();

    let fullTime = `${date[dateIndex]} ${month[monthIndex]} ${year}`;
    return fullTime;
}

function getDistanceTime(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let getTime = end - start;

    let distanceDay = Math.floor(getTime / (1000 * 3600 * 24));
    let distanceMonth = Math.floor(distanceDay / 31);

    duration =
        distanceMonth <= 0 ? distanceDay + " Hari" : distanceMonth + " Bulan";

    if (start > end) {
        alert("Error Your Date");
    } else if (start < end) {
        return `${duration}`;
    }
}

app.listen(port, function (req, res) {
    console.log(`Server berjalan di port ${port}`);
});
