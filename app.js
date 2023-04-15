const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is Running");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Returns a list of all todos whose status is 'TO DO'
app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    todo = "",
    search_q = "",
  } = request.query;

  let allList;
  if (status === "TO DO") {
    allList = `
    SELECT *
    FROM todo
    WHERE status = '${status}';`;
  } else if (priority === "HIGH" && status === "IN PROGRESS") {
    allList = `
    SELECT *
    FROM todo
    WHERE priority = '${priority}' AND status = '${status}';`;
  } else if (priority === "HIGH") {
    allList = `
      SELECT *
      FROM todo
        WHERE priority = '${priority}';`;
  } else if (search_q === "Play") {
    allList = `
    SELECT *
    FROM todo
    WHERE todo LIKE '%${search_q}%';`;
  }

  const finalList = await db.all(allList);
  response.send(finalList);
});
//Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const newTodo = await db.get(getTodo);
  response.send(newTodo);
});

//Create a todo in the todo table
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const createTodo = `
    INSERT INTO 
        todo(id,todo,priority,status)
    VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(createTodo);
  response.send("Todo Successfully Added");
});

//Update a Todo
app.put("/todos/:todoId/", async (request, response) => {
  const todoDetails = request.body;
  const { id = "", todo = "", priority = "", status = "" } = todoDetails;
  const { todoId } = request.params;
  let updateTodo;
  if (status !== "") {
    updateTodo = `
        UPDATE 
         todo 
        SET 
        status = '${status}'
        WHERE id = ${todoId};`;
    await db.run(updateTodo);
    response.send("Status Updated");
  } else if (priority !== "") {
    updateTodo = `
        UPDATE 
         todo 
        SET 
        priority = '${priority}'
        WHERE id = ${todoId};`;
    await db.run(updateTodo);
    response.send("Priority Updated");
  } else if (todo !== "") {
    updateTodo = `
        UPDATE 
         todo 
        SET 
        todo = '${todo}'
        WHERE id = ${todoId};`;
    await db.run(updateTodo);
    response.send("Todo Updated");
  }
});

//Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
