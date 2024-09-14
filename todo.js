#!/usr/bin/env node

/**
 * A simple JavaScript CLI for managing a todo list.
 * Supports creating, reading, updating, and deleting todos.
 */

// Import required modules
const fs = require("fs");
const path = require("path");

// Define the path to the todo JSON file
const todosFilePath = path.join(__dirname, "todos.json");

// Load existing todos from the file, or initialize an empty array if the file doesn't exist
let todos = [];
if (fs.existsSync(todosFilePath)) {
  // Read the file contents
  const data = fs.readFileSync(todosFilePath, "utf8");
  // Parse the JSON data
  todos = JSON.parse(data);
}

// Get the command and arguments from the command line input
const [, , command, ...args] = process.argv;

// Define a function to save the todos array back to the JSON file
function saveTodos() {
  // Convert the todos array to a JSON string with indentation
  const jsonData = JSON.stringify(todos, null, 2);
  // Write the JSON data to the file
  fs.writeFileSync(todosFilePath, jsonData);
}

// Process the command input and execute the corresponding action
switch (command) {
  case "add":
    // Join all arguments to form the todo text
    const todoText = args.join(" ").trim();
    // Check if the todo text is provided
    if (!todoText) {
      console.log("Please provide a todo item.");
      break;
    }
    // Add the new todo to the todos array
    todos.push({ text: todoText, completed: false });
    // Save the updated todos array to the file
    saveTodos();
    console.log(`Added todo: "${todoText}"`);
    break;

  case "list":
    // Check if there are any todos to display
    if (todos.length === 0) {
      console.log("No todos found.");
    } else {
      console.log("Todo List:");
      // Loop through the todos array and display each todo with its index
      todos.forEach((todo, index) => {
        // Display [x] if completed, [ ] if not
        const status = todo.completed ? "[x]" : "[ ]";
        console.log(`${index + 1}. ${status} ${todo.text}`);
      });
    }
    break;

  case "update":
    // Parse the index of the todo to update (subtract 1 for zero-based index)
    const updateIndex = parseInt(args[0], 10) - 1;
    // Join the rest of the arguments to form the new todo text
    const newText = args.slice(1).join(" ").trim();
    // Validate the index and new text
    if (isNaN(updateIndex) || updateIndex < 0 || updateIndex >= todos.length) {
      console.log("Invalid index for update.");
      break;
    }
    if (!newText) {
      console.log("Please provide new text for the todo.");
      break;
    }
    // Get the old text for display
    const oldText = todos[updateIndex].text;
    // Update the todo text
    todos[updateIndex].text = newText;
    // Save the updated todos array to the file
    saveTodos();
    console.log(
      `Updated todo ${updateIndex + 1}: "${oldText}" to "${newText}"`
    );
    break;

  case "delete":
    // Parse the index of the todo to delete (subtract 1 for zero-based index)
    const deleteIndex = parseInt(args[0], 10) - 1;
    // Validate the index
    if (isNaN(deleteIndex) || deleteIndex < 0 || deleteIndex >= todos.length) {
      console.log("Invalid index for delete.");
      break;
    }
    // Remove the todo from the array
    const deleted = todos.splice(deleteIndex, 1);
    // Save the updated todos array to the file
    saveTodos();
    console.log(`Deleted todo ${deleteIndex + 1}: "${deleted[0].text}"`);
    break;

  case "complete":
    // Parse the index of the todo to complete
    const completeIndex = parseInt(args[0], 10) - 1;
    // Validate the index
    if (
      isNaN(completeIndex) ||
      completeIndex < 0 ||
      completeIndex >= todos.length
    ) {
      console.log("Invalid index for completion.");
      break;
    }
    // Toggle the completion status
    todos[completeIndex].completed = !todos[completeIndex].completed;
    // Save the updated todos array to the file
    saveTodos();
    console.log(
      `Marked todo ${completeIndex + 1} as ${
        todos[completeIndex].completed ? "completed" : "pending"
      }.`
    );
    break;

  default:
    // Handle invalid commands
    console.log('Invalid command. Use "add", "list", "update", or "delete".');
    break;
}
