#!/usr/bin/env node

/**
 * A simple JavaScript CLI for managing a todo list.
 * Supports creating, reading, updating, and deleting todos.
 */

// Import required modules
const Datastore = require("nedb");
const path = require("path");

// Define the path to the todo JSON file
// const todosFilePath = path.join(__dirname, "todos.json");

// Initialize database
const db = new Datastore({
  filename: path.join(__dirname, "todos.db"),
  autoload: true,
});

// Get the command and arguments from the command line input
const [, , command, ...args] = process.argv;

function validateIndex(index, max) {
  if (isNaN(index) || index < 0 || index >= max) {
    throw new Error("Invalid index.");
  }
}

// Process the command input and execute the corresponding action
switch (command) {
  case "add":
    try {
      const todoText = args.join(" ").trim();
      if (!todoText) {
        throw new Error("Please provide a todo item.");
      }
      const newTodo = { text: todoText, completed: false };
      db.insert(newTodo, (err, doc) => {
        if (err) throw err;
        console.log(`Added todo: "${doc.text}"`);
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
    break;

  case "list":
    db.find({}, (err, docs) => {
      if (err) {
        console.log("Error fetching todos:", err);
      } else if (docs.length === 0) {
        console.log("No todos found.");
      } else {
        console.log("Todo List:");
        docs.forEach((todo, index) => {
          const status = todo.completed ? "[x]" : "[ ]";
          console.log(`${index + 1}. ${status} ${todo.text}`);
        });
      }
    });
    break;

  case "update":
    try {
      const updateIndex = parseInt(args[0], 10) - 1;
      const newText = args.slice(1).join(" ").trim();
      if (!newText) {
        throw new Error("Please provide new text for the todo.");
      }
      db.find({}, (err, docs) => {
        if (err) throw err;
        validateIndex(updateIndex, docs.length);
        // Proceed with the update...
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
    break;

  case "delete":
    const deleteIndex = parseInt(args[0], 10) - 1;
    db.find({}, (err, docs) => {
      if (err || deleteIndex < 0 || deleteIndex >= docs.length) {
        console.log("Invalid index for delete.");
      } else {
        const todoToDelete = docs[deleteIndex];
        db.remove({ _id: todoToDelete._id }, {}, (err, numRemoved) => {
          if (err) {
            console.log("Error deleting todo:", err);
          } else {
            console.log(
              `Deleted todo ${deleteIndex + 1}: "${todoToDelete.text}"`
            );
          }
        });
      }
    });
    break;

  case "complete":
    const completeIndex = parseInt(args[0], 10) - 1;
    db.find({}, (err, docs) => {
      if (err || completeIndex < 0 || completeIndex >= docs.length) {
        console.log("Invalid index for completion.");
      } else {
        const todoToComplete = docs[completeIndex];
        db.update(
          { _id: todoToComplete._id },
          { $set: { completed: !todoToComplete.completed } },
          {},
          (err) => {
            if (err) {
              console.log("Error updating todo:", err);
            } else {
              console.log(
                `Marked todo ${completeIndex + 1} as ${
                  !todoToComplete.completed ? "completed" : "pending"
                }.`
              );
            }
          }
        );
      }
    });
    break;

  default:
    // Handle invalid commands
    console.log('Invalid command. Use "add", "list", "update", or "delete".');
    break;
}
