
--INSERTING DATA--

-- add a new employee
INSERT INTO employees (fname, lname, role_id)
	VALUES (:fnameInput, :lnameInput, :role_id_from_dropdown_Input);
-- add a new manager-employee relationship
INSERT INTO manager_employee (employee_id, manager_id)
	VALUES (:employee_id_from_dropdown_Input, :manager_id_from_dropdown_Input);
-- add a new role
INSERT INTO roles (title)
	VALUES (:titleInput);
-- add a new food
INSERT INTO food (name, calories, price)
	VALUES (:nameInput, :caloriesInput, :priceInput);
-- add a new customer
INSERT INTO customers (fname, lname)
	VALUES (:fnameInput, :lnameInput);
-- add a new order
INSERT INTO orders (customer_id)
	VALUES (:customer_id_from_dropdown_Input);
-- add food to order
INSERT INTO food_orders (order_id, food_id)
	VALUES (:order_id_from_dropdown_Input, :food_id_from_dropdown_Input);
-- add a new menu
INSERT INTO menus (name)
	VALUES (:nameInput);
-- add food to menu
INSERT INTO food_menu (menu_id, food_id)
	VALUES (:menu_id_from_dropdown_Input, :food_id_from_dropdown_Input);

--DELETING DATA--

-- deleting an employee
DELETE FROM employees
	WHERE employee_id = :employee_id;
-- deleting a role
DELETE FROM roles
	WHERE role_id = :role_id;
-- deleting a food
DELETE FROM food
	WHERE food_id = :food_id;
-- deleting a customer
DELETE FROM customers
	WHERE customer_id = :customer_id;
-- deleting an order
DELETE FROM orders
	WHERE order_id = :order_id;
-- deleting food from an order
DELETE FROM food_orders
		WHERE order_id = :order_id AND food_id = :food_id;
-- deleting a menu
DELETE FROM menus
	WHERE menu_id = :menu_id;
-- deleting food from a menu
DELETE FROM food_menu
		WHERE menu_id = :menu_id AND food_id = :food_id;

--ALTERING RELATIONSHIPS--

-- change employee role
UPDATE employees
	SET role_id = :role_id_from_dropdown_Input
	WHERE employee_id = :employee_id;

-- change food's menu
UPDATE food_menu
	SET menu_id = :menu_id-from_dropdown_Input
	WHERE food_id = :food_id;

-- update order's food
UPDATE order
	SET food_id = :food_id_from_dropdown_Input
	WHERE order_id = :customer_id;



--GETTING DATA--

-- get name and id from specific customer
SELECT * FROM customers WHERE customer_id = :customer_id;

-- get name and id from all Customers
SELECT CONCAT (fname, ' ', lname) AS CustomerName, customer_id FROM customers;

-- get all orders with their associated customer, food, and total price
SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName,
O.order_id AS OrderNumber,
F.name AS FoodOrdered,
FP.TotalPrice FROM customers C
LEFT JOIN orders O on O.customer_id = C.customer_id
LEFT JOIN food_orders FO on FO.order_id = O.order_id
LEFT JOIN food F on F.food_id = FO.food_id
LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O
INNER JOIN food_orders FO ON FO.order_id = O.order_id
INNER JOIN food F on F.food_id = FO.food_id
GROUP BY order_id) FP on FP.order_id = O.order_id
GROUP BY OrderNumber, CustomerName, FoodOrdered;

-- get all orders from one specific customer and t heir associated food and total price
SELECT CONCAT(C.fname, ' ', C.lname) AS CustomerName,
O.order_id AS OrderNumber,
 F.name AS FoodOrdered,
 FP.TotalPrice, C.customer_id, F.food_id FROM customers C
 LEFT JOIN orders O on O.customer_id = C.customer_id
 LEFT JOIN food_orders FO on FO.order_id = O.order_id
 LEFT JOIN food F on F.food_id = FO.food_id
 LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O
 INNER JOIN food_orders FO ON FO.order_id = O.order_id
 INNER JOIN food F on F.food_id = FO.food_id
 GROUP BY order_id) FP on FP.order_id = O.order_id
 WHERE C.customer_id = :customer_id
 GROUP BY OrderNumber, CustomerName, FoodOrdered
 ORDER BY CustomerName;

 -- get one specific order and its associated food and total price
 SELECT O.order_id AS OrderNumber,
 F.name AS FoodOrdered,
 F.price, FP.TotalPrice, F.food_id FROM orders O
 LEFT JOIN food_orders FO on FO.order_id = O.order_id
 LEFT JOIN food F on F.food_id = FO.food_id
 LEFT JOIN (SELECT O.order_id, SUM(F.price) AS TotalPrice from orders O
 INNER JOIN food_orders FO ON FO.order_id = O.order_id
 INNER JOIN food F on F.food_id = FO.food_id
 GROUP BY order_id) FP on FP.order_id = O.order_id
 WHERE O.order_id = :order_id;

-- get name and role for specific employee
SELECT * FROM employees E INNER JOIN roles R ON E.role_id = R.role_id WHERE employee_id = :employee_id;

-- get all employees and their associated roles
SELECT CONCAT(E.fname, ' ', E.lname) AS EmployeeName, R.title AS EmployeeTitle, E.employee_id, R.role_id
FROM employees E
INNER JOIN roles R ON E.role_id = R.role_id;

-- get all roles
SELECT * FROM roles;

-- get one food and its associated menu
SELECT F.name AS food, M.menu_id, M.name AS menu, F.food_id, F.calories, F.price FROM food F
INNER JOIN food_menu FM ON FM.food_id = F.food_id
INNER JOIN menus M on M.menu_id = FM.menu_id
WHERE F.food_id = :food_id AND M.menu_id = :menu_id
ORDER BY M.name DESC;

-- get all foods with their associated menus
SELECT F.name AS food, M.name AS menu FROM food F
INNER JOIN food_menu FM ON FM.food_id = F.food_id
INNER JOIN menus M on M.menu_id = FM.menu_id
ORDER BY M.name DESC;

-- get one menu and its associated food
SELECT M.menu_id, M.name, F.food_id, F.name AS food FROM menus M
LEFT JOIN food_menu FM ON FM.menu_id = M.menu_id
LEFT JOIN food F ON F.food_id = FM.food_id
WHERE M.menu_id = :menu_id
ORDER BY M.name DESC;

-- get all menus and their associated foods
SELECT M.menu_id, M.name, F.food_id, F.name AS food FROM menus M
LEFT JOIN food_menu FM ON FM.menu_id = M.menu_id
LEFT JOIN food F ON F.food_id = FM.food_id
GROUP BY M.name
ORDER BY M.name DESC;

-- get all orders
SELECT order_id FROM orders
