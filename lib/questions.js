
const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

class Questions {
    constructor() {
  
    }
    menuPrompt() {
      console.log();
      return inquirer
        .prompt([
          {
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: ['Add Employee', 'View All Employees', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
          },
        ])
        .then((answers) => {
          if (answers.menu == "View All Departments") {
            this.viewDepartments();
          }  
          if (answers.menu == "View All Roles") {
            this.viewRoles();
          }  
          if (answers.menu == "View All Employees") {
            this.viewEmployees();
          }
          if (answers.menu == "Add Employee") {
            this.addEmployee();
          }
          if (answers.menu == "Add Role") {
            this.addRole();
          }
          if (answers.menu == "Add Department") {
            this.addDepartment();
          }
          if (answers.menu == "Update Employee Role") {
            this.updateEmployee();
          }
          if (answers.menu == "Quit") {
            console.log("Exited Employee Manager");
          }
        })
        .catch((err) => {
          console.log(err);
          console.log('Oops. Something went wrong.');
        });
    }

    async viewEmployees(){
      const data = await db.promise().query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.department_name AS department, roles.salary, concat(m.first_name,' ',m.last_name) AS Manager FROM employees_db.employee LEFT JOIN employees_db.roles ON employee.role_id = roles.id LEFT JOIN employees_db.department ON roles.department_id = department.id LEFT JOIN employees_db.employee m ON employee.manager_id = m.id;`);
      console.table(data[0]);
      this.menuPrompt();
    };

    async viewRoles(){
      const data = await db.promise().query(`SELECT roles.id, roles.title, department.department_name AS department, roles.salary FROM employees_db.roles JOIN employees_db.department ON roles.department_id = department.id;`);
      console.table(data[0]);
      this.menuPrompt();
    };

    async viewDepartments(){
      const data = await db.promise().query(`SELECT * from department;`);
      console.table(data[0]);
      this.menuPrompt();
    };

    async addEmployee(){
      const data = await db.promise().query(`SELECT * FROM roles`);
      const roles = data[0].map(role => (
        {
          name: role.title,
          value: role.id
        }
      ));

      const eData = await db.promise().query(`SELECT * FROM employee`);
      const employees = eData[0].map(employee => (
        {
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }
      ));
      return inquirer
        .prompt([
          {
            type: 'input',
            name: 'first_name',
            message: 'What is the employee\'s first name?'
          },
          {
            type: 'input',
            name: 'last_name',
            message: 'What is the employee\'s last name?'
          },
          {
            type: 'list',
            name: 'role',
            message: 'What is the employee\'s role?',
            choices: roles,
          },
          {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: employees,
          }
        ])
        .then((answers) => {
          const iData = db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answers.first_name}", "${answers.last_name}", ${answers.role}, ${answers.manager});`);
          console.log(`Added ${answers.first_name} ${answers.last_name} to the database`);
          this.menuPrompt();  
        });
    }

    async addRole(){
      const data = await db.promise().query(`SELECT * FROM department`);
      const departments = data[0].map(d => (
        {
          name: d.department_name,
          value: d.id
        }
      ));

      return inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?'
          },
          {
            type: 'input',
            name: 'salary',
            message: 'What is salary of the role?'
          },
          {
            type: 'list',
            name: 'department',
            message: 'Which department does the role belong to?',
            choices: departments,
          }
        ])
        .then((answers) => {
          const iData = db.query(`INSERT INTO roles (title, department_id, salary) VALUES ("${answers.name}", "${answers.department}", ${answers.salary});`);
          console.log(`Added ${answers.name} to the database`);
          this.menuPrompt();  
        });
    }

    async addDepartment(){
      return inquirer
        .prompt([
          {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?'
          }
        ])
        .then((answers) => {
          const iData = db.query(`INSERT INTO department (department_name) VALUES ("${answers.department}");`);
          console.log(`Added ${answers.department} to the database`);
          this.menuPrompt();  
        });
    }

    async updateEmployee(){
      const data = await db.promise().query(`SELECT * FROM roles`);
      const roles = data[0].map(role => (
        {
          name: role.title,
          value: role.id
        }
      ));

      const eData = await db.promise().query(`SELECT * FROM employee`);
      const employees = eData[0].map(employee => (
        {
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }
      ));
      return inquirer
        .prompt([
          {
            type: 'list',
            name: 'name',
            message: 'Which employee\'s role do you want to update?',
            choices: employees
          },
          {
            type: 'list',
            name: 'role',
            message: 'Which role do you want to assign the selected employee?',
            choices: roles
          }
        ])
        .then((answers) => {
          const iData = db.query(`UPDATE employee SET role_id = ${answers.role} WHERE id = ${answers.name};`);
          console.log(`Updated employee's role`);
          this.menuPrompt();  
        });
    } 

}
  
  
  
  module.exports = Questions;