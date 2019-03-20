
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



-- get all customers with their associated orders, food, and total price
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


-- get all foods with their associated menus
SELECT F.name AS food, M.name AS menu FROM food F
INNER JOIN food_menu FM ON FM.food_id = F.food_id
INNER JOIN menus M on M.menu_id = FM.menu_id
ORDER BY M.name DESC;

-- get all orders
SELECT order_id FROM orders
