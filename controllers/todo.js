import ToDo from "../modals/todo.js";

async function create(req, res) {
  const { title, description, completed } = req.body;
  try {
    if (!title || !description)
      throw new Error(
        "Failed to create ToDo title and description are required."
      );

    const existingTodo = await ToDo.exists({ title });
    if (existingTodo != null) throw new Error("ToDo already exists");

    ToDo.create({
      title,
      description,
      completed,
      user: req?.authUser?.uId,
      completed: false
    }).then((data) => {
      res.status(200).json({
        success: true,
        message: "ToDo is created.",
        toDo: data,
      });
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllTodos(req, res) {
  try {
    ToDo.find({ user: req?.authUser?.uId }).populate("user", "name email").then((data) => {
      res.status(200).json({
        success: true,
        toDo: data,
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function update(req, res) {
  const { id, title, description, completed } = req.body;
  try {
    const existingTodo = await ToDo.exists({ title, _id: { $ne: id } });

    if (existingTodo != null) throw new Error("This title is already used. ");

    ToDo.findOneAndUpdate(
      { _id: id, user: req?.authUser?.uId },
      { title, description, completed }
    ).then((data) => {
      res.status(200).json({
        success: true,
        message: "ToDo is Updated",
        toDo: data,
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteTodo(req, res) {
  const { id } = req.params;

  try {
    const existingTodo = await ToDo.exists({ _id: id, user: req?.authUser?.uId });

    if (existingTodo == null) throw new Error("ToDo does not exist");

    ToDo.findOneAndDelete({ _id: id, user: req?.authUser?.uId }).then((data) => {
      res.status(200).json({
        success: true,
        message: `${data.title} ToDo is deleted.`,
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export { create, getAllTodos, update, deleteTodo };
