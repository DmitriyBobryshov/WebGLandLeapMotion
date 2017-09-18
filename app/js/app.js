
// Подключаем необходимые модули для физики объектов	
Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

// Объявление переменных
var container;
var camera, scene, renderer, controlindex = -2, lastindex = -2;
var objects = [];
var collideFinger = [];
var armMeshes = [];
var boneMeshes = [];
var mode = false;
var modeCycle0 = false;
var startCycle0, endCycle0;
var modeCycle1 = false;
var startCycle1, endCycle1;
var lastintersects1 = 1;
var lastintersects2 = 1;



// Инициализация программы
initScene();
// Подключение контроллера
var controller = new Leap.Controller();
// Метод connect() подключает объект контроллера к серверу Leap Motion WebSocket.
controller.connect();

document.getElementById('info').innerHTML = 'Отключен';

// Если Leap Motion подключен, то вызывается функция Leap.loop(), которая автоматически настраивает цикл обновления. На каждом интервале обновления loop() вызывает функцию обновления leapUpdate(), передавая ей текущий кадр. Параметр enableGestures указывает на использование жестов. 
controller.on('deviceStreaming', onApp);
function onApp(frame)
{
	Leap.loop( {enableGestures: true} , leapUpdate )
}
// Если Leap Motion отключен, то в блоке информации выводится «Отключен» 
controller.on('deviceStopped', offApp);
function offApp(frame)
{
    document.getElementById('info').innerHTML = 'Отключен';
}

// Функция, отвечающая за визуализацию сцены и обработку физики объектов
function initScene() {
	// Область для отображения сцены
	container = document.getElementById( 'container' );
	// Создание 3D-сцены
	// Отображение сцены
	// WebGLRenderer() – класс, который отвечает за рендеринг (визуализацию) сцены. Параметры alpha – прозрачность фона, antialias – сглаживание объектов
	renderer = new THREE.WebGLRenderer({  alpha: 1, antialias: true } );
	// Установка размеров приложения (ширина, высота) в соответствии с размером экрана
	renderer.setSize( window.innerWidth, window.innerHeight );
	// Вывод приложения в блоке container
	container.appendChild( renderer.domElement );
	// Создание сцены
	scene = new Physijs.Scene;
	scene.setGravity(new THREE.Vector3( 0, -100, 0 ));
	// Создание камеры, и установка ее параметров. Класс PerspectiveCamera(угол обзора камеры, соотношение сторон, минимальное расстояние от камеры, максимальное расстояние от камеры)
	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 5000);
	// Расположение камеры
	camera.position.set(0, 500, 450);
	// Поворот камеры по оси X
	camera.rotation.x = -0.2*Math.PI;
	
	// Объекты
	// В Three.js работа с объектами осуществляется с помощью специальных классов BoxGeometry(), SphereGeometry() и т.д., которые содержат все вершины и грани конкретного объекта (куба, сферы и т.д.). Материал, который используется для объектов, обозначается через класс MeshLambertMaterial({color : 0x00FF00}). В атрибутах класса указывается цвет. Для того, чтобы применить материал к объекту используется класс Mesh(geometry, material). И затем через метод Add(object) добавляется в сцену.
	// Поверхность со стенами, ограничивающими движение объектов, создаются с помощью Physi.js и класса BoxMesh (new BoxGeometry(ширина, высота, толщина), материал, значение силы тяготения)
	// Используется класс BoxGeometry(ширина, высота, толщина)
	var groundMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
	var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(465, 5, 465), groundMaterial, 0);

	// Ограничения движения объектов
	var borderLeft = new Physijs.BoxMesh(new THREE.BoxGeometry (5, 300, 465), groundMaterial, 0);
	borderLeft.position.set(230,150,0);
	ground.add(borderLeft);

	var borderRight = new Physijs.BoxMesh(new THREE. BoxGeometry (5, 300, 465), groundMaterial, 0);
	borderRight.position.set(-230,150,0);
	ground.add(borderRight);

	var borderBottom = new Physijs.BoxMesh(new THREE. BoxGeometry(465, 300, 5), groundMaterial, 0);
	borderBottom.position.set(0,150, 230);
	borderBottom.visible = false;
	ground.add(borderBottom);

	var borderTop = new Physijs.BoxMesh(new THREE.BoxGeometry (465, 300, 5), groundMaterial, 0);
	borderTop.position.set(0,150,-230);
	ground.add(borderTop);
	
	ground.position.set(0,150,-30);
	scene.add(ground);

	// Куб
	// Класс BoxGeometry(ширина, высота, толщина)
	var cubeGeometry = new THREE.BoxGeometry(35,35,35);
	var cubeMaterial = new THREE.MeshLambertMaterial({color : 0x00FF00} );
	var cube = new Physijs.BoxMesh(cubeGeometry, cubeMaterial);
	cube.position.set(-20,170,50);
	objects.push(cube);
	scene.add(cube);

	// Сфера
	// Класс SphereGeometry(радиус сферы, количество горизонтальных сегментов, количество вертикальных сегментов)
	var sphereGeometry = new THREE.SphereGeometry(20,20,20);
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x500050});
	var sphere = new Physijs.SphereMesh(sphereGeometry,sphereMaterial);
	sphere.position.set(30,170,-40);
	objects.push(sphere);
	scene.add(sphere);

	// Цилиндр
	// Класс CylinderGeometry(радиус верхнего основания, радиус нижнего основания, высота, количество вертикальных сегментов)
	var cylGeometry = new THREE.CylinderGeometry(30, 30, 30, 50);
	var cylMaterial = new THREE.MeshLambertMaterial ( {color: 0xEA7414} );
	var cylinder = new Physijs.CylinderMesh(cylGeometry, cylMaterial);
	cylinder.position.set(70,170,50);
	objects.push(cylinder);
	scene.add(cylinder);

	// Конус
	// Класс ConeGeometry(радиус основания, высота, количество вертикальных сегментов)
	var coneGeometry = new THREE.ConeGeometry(25, 35, 15);
	var coneMaterial = new THREE.MeshLambertMaterial ( {color: 0xffcc00} );
	var cone = new Physijs.ConeMesh( coneGeometry, coneMaterial );
	cone.position.set(-70,170,-40);
	objects.push(cone);
	scene.add(cone);

	// Объекты-коллижн для взаимодействия с объектами сцены
	for (var i = 0; i < 4; i++){
		var collideGeometry1 = new THREE.SphereGeometry(5,10,10);
		var collideMaterial1 = new THREE.MeshLambertMaterial({color: 0x500050});
		var collide = new THREE.Mesh(collideGeometry1,collideMaterial1);
		collide.position.set(0,0,0);
		collide.visible = false;
		collideFinger.push(collide);
		scene.add(collide);
	}

	// Источники света
	// В Three.js есть несколько источников освещения: направленный, точечный, источник глобального освещения. Используется направленный источник освещения. Класс DirectionalLight()
	var dirLight = new THREE.DirectionalLight();
	dirLight.position.set(25, 23, 15);
	scene.add(dirLight);

	var dirLight2 = new THREE.DirectionalLight();
	dirLight2.position.set(-25, 23, 15);
	scene.add(dirLight2);

	// Рендеринг (визуализация) сцены 
	renderer.render(scene, camera);
	// Вызов функции onWindowResize, если произошло изменение размеров окна браузера
	window.addEventListener( 'resize', onWindowResize, false );
}

// Функция, которая масштабирует сцену в случае изменения размеров окна браузера
function onWindowResize() {
	// Вычисление соотношения сторон
	camera.aspect = window.innerWidth / window.innerHeight;
	// При изменении параметров камеры нужно вызывать метод
	camera.updateProjectionMatrix();
	// Установка размеров приложения (ширина, высота) в соответствии с размером экрана
	renderer.setSize( window.innerWidth, window.innerHeight );
	// Рендеринг (визуализация) сцены
	renderer.render(scene, camera);
}

function leapUpdate( frame ) {
// Создание трехмерной модели рук
var hand = frame.hands[0]; 	
var countBones = 0; 
var boneMesh;
boneMeshes.forEach( function(item) { scene.remove(item) } );
for (var hand of frame.hands) {
	for (var finger of hand.fingers) {
		for (var bone of finger.bones) {
		if (countBones++ == 0) { continue; }
			boneMesh = boneMeshes [countBones] || addMesh(boneMeshes);
			updateMesh(bone, boneMesh);	
		}
	}
}
// Проверка нажатия клавиши "Enter"
document.onkeydown = function checkKeycode(event)
{
var keycode;
// Смена режима взаимодействия
if (event.keyCode == 13) mode = !mode;
}

if (mode == false){
// Вывод информации о состоянии подключения и о режиме взаимодействия 
document.getElementById('info').innerHTML = 'Подключен. Режим: прямое взаимодействие';
// Если объект за границами сцена, то перемещение его обратно в сцену
for (var i=0; i < objects.length; i++) {
	if (objects[i].position.y < 100){
		objects[i].position.set(0, 230, 0);
		objects[i].__dirtyPosition = true;
	}
}

if (frame.hands.length > 0) { 	

for (var i = 0; i < frame.hands.length; i++) {
// Для первой распознанной руки
if (i == 0){
	var hand = frame.hands[i];
	if (modeCycle0 == false) {
		startCycle0 = 1;
		endCycle0 = hand.pointables.length;
	} 
	for (var j = startCycle0; j < endCycle0; j ++){
		// Переменные пальцев
     	var Finger0 = hand.pointables[0];
     	var Finger1 = hand.pointables[j];
     	// Переменные ориентации в пространтсве пальцев
        var Finger0Direct = Finger0.direction;
        var Finger1Direct = Finger1.direction;
        // Переменные позиции пальцев
        var Finger0Pos = Finger0.tipPosition;
        var Finger1Pos = Finger1.tipPosition;
        // Установка расположения объектов-коллижн в позиции пальцев
    	collideFinger[0].position.set(Finger0Pos[0], Finger0Pos[1], Finger0Pos[2]);
    	collideFinger[1].position.set(Finger1Pos[0], Finger1Pos[1], Finger1Pos[2]);
    	// Создание луча, проходящего через два пальца
        var a1 = new THREE.Vector3(collideFinger[0].position.x, collideFinger[0].position.y, collideFinger[0].position.z);
        var ray1 = new THREE.Raycaster( collideFinger[1].position, a1.sub(collideFinger[1].position).normalize() );
        // Массив пересекаемых лучом объектов
        var intersects1 = ray1.intersectObjects( objects );
		var vec1 = new THREE.Vector3( 0, 0, 0 );
		// Если число пересекаемых лучом объектов > 0 и расстояние до перевого пересекаемого объекта < 25
        if ( intersects1.length > 0 && intersects1[0].distance < 25 ) 
        {
			// Отключение силы тяготения объекта
			intersects1[0].object.setAngularFactor( vec1 );
			intersects1[0].object.setLinearFactor( vec1 );
			// Установка объекта между пальцев
	        intersects1[0].object.position.x =+ (collideFinger[0].position.x + collideFinger[1].position.x)/2;
			intersects1[0].object.position.y =+ (collideFinger[0].position.y + collideFinger[1].position.y)/2;
			intersects1[0].object.position.z =+ (collideFinger[0].position.z + collideFinger[1].position.z)/2; 
        	// Фиксирование изменения положения объекта 
        	intersects1[0].object.__dirtyPosition = true;
        	// Установка параметров вращения объета взависимости от поворота руки
        	if (hand.type == "right") intersects1[0].object.rotation.set(Finger0Direct[1], -Finger0Direct[0],  hand.palmNormal[0] + 0.5);
        	else intersects1[0].object.rotation.set(Finger0Direct[1], -Finger0Direct[0],  hand.palmNormal[0] - 0.5);
			// Фиксирование изменения вращения объекта 
			intersects1[0].object.__dirtyRotation = true;
			// Присваивание переменной номер объекта
			lastintersects1 = objects.indexOf(intersects1[0].object);
			startCycle0 = j;
        	endCycle0 = j + 1;
        	modeCycle0 = true;

        } else {
			// Включение силы тяготения объекта
			vec1.set( 1, 1, 1 );
			objects[lastintersects1].setAngularFactor( vec1 );
			objects[lastintersects1].setLinearFactor( vec1 );
			modeCycle0 = false;
    	}	
	}
}
// Для второй распознанной руки
if (i == 1) {
	var hand = frame.hands[i];
	if (modeCycle1 == false) {
		startCycle1 = 1;
		endCycle1 = hand.pointables.length;
	} 
	for (var j = startCycle1; j < endCycle1; j ++){
     	var Finger0 = hand.pointables[0];
     	var Finger1 = hand.pointables[j];
        var Finger0Direct = Finger0.direction;
        var Finger0Pos = Finger0.tipPosition;
        var Finger1Pos = Finger1.tipPosition;
    	collideFinger[2].position.set(Finger0Pos[0], Finger0Pos[1], Finger0Pos[2]);
    	collideFinger[3].position.set(Finger1Pos[0], Finger1Pos[1], Finger1Pos[2]);
        var a2 = new THREE.Vector3(collideFinger[2].position.x, collideFinger[2].position.y, collideFinger[2].position.z);
        var ray2 = new THREE.Raycaster( collideFinger[3].position, a2.sub(collideFinger[3].position).normalize() );
        var intersects2 = ray2.intersectObjects( objects );
		var vec2 = new THREE.Vector3( 0, 0, 0 );
        if ( intersects2.length > 0 && intersects2[0].distance < 25 ) 
        {
			intersects2[0].object.setAngularFactor( vec2 );
			intersects2[0].object.setLinearFactor( vec2 );
	        intersects2[0].object.position.x =+ (collideFinger[2].position.x + collideFinger[3].position.x)/2;
			intersects2[0].object.position.y =+ (collideFinger[2].position.y + collideFinger[3].position.y)/2;
			intersects2[0].object.position.z =+ (collideFinger[2].position.z + collideFinger[3].position.z)/2;
        	intersects2[0].object.__dirtyPosition = true;
			if (hand.type == "right") intersects2[0].object.rotation.set(Finger0Direct[1], -Finger0Direct[0],  hand.palmNormal[0] + 0.5);
        	else intersects2[0].object.rotation.set(Finger0Direct[1], -Finger0Direct[0],  hand.palmNormal[0] - 0.5);
			intersects2[0].object.__dirtyRotation = true;
			lastintersects2 = objects.indexOf(intersects2[0].object);
			startCycle1 = j;
        	endCycle1 = j + 1;
        	modeCycle1 = true;
        } else {
			vec2.set( 1, 1, 1 );
			objects[lastintersects2].setAngularFactor( vec2 );
			objects[lastintersects2].setLinearFactor( vec2 );
			modeCycle1 = false;
    	}
	}
}
}
}
} else {
// Вывод информации о состоянии подключения и о режиме взаимодействия
document.getElementById('info').innerHTML = 'Подключен. Режим: опосредованное взаимодействие';
var vector = new THREE.Vector3( 0, 0, 0 );
if (frame.hands.length > 0) {
// Переменной controlindex присваиваются результат выполнения функции focusObj(frame): -2 – режим взаимодействия (раскрыта ладонь), -1 – режим наведения указательным пальцем на объект, от 0 до 3 – номер выделенного объекта
controlindex = focusObj(frame);
if (controlindex > -1) {
if (controlindex != lastindex && lastindex > -1) objects[lastindex].material.opacity = 1;
// Прозрачность объекта 70%
objects[controlindex].material.opacity = 0.7;
lastindex = controlindex;
} else if ((controlindex == -1) && (lastindex > -1)){
		// Прозрачность объекта 100%
		objects[lastindex].material.opacity = 1;
		// Включение силы тяготения объекта
		vector.set( 1, 1, 1 );
		objects[lastindex].setAngularFactor( vector );
		objects[lastindex].setLinearFactor( vector );
		lastindex = -1;
	} else if ((lastindex > -1) && (controlindex == -2)){
				objects[lastindex].material.opacity = 0.7;
				// Отключение силы тяготения объекта
				vector.set( 0, 0, 0 );
				objects[lastindex].setAngularFactor( vector );
				objects[lastindex].setLinearFactor( vector );
				// Вызов функции для взаимодействия с выделенным объектом
				updateObj(frame);
			}
} else {
for (var i=0; i < objects.length; i++) {
// Включение силы тяготения объекта
vector.set( 1, 1, 1 );
objects[i].setAngularFactor( vector );
objects[i].setLinearFactor( vector );
// Прозрачность объекта 100%
objects[i].material.opacity = 1;
lastindex = -2;
// Если объект за границами сцена, то перемещение его обратно в сцену
if (objects[i].position.y < 100){
	objects[i].position.set(0, 230, 0);
	objects[i].__dirtyPosition = true;
}
}
}
}
// Визуализация сцены
renderer.render(scene,camera);
// Запуск физики сцены
scene.simulate();	
}

function focusObj (frame) {
	// Если вытянут указательный палец
var finger = frame.pointables[1]; // Указательный палец
if (finger.extended && 
!frame.pointables[0].extended && 
!frame.pointables[2].extended &&
!frame.pointables[3].extended &&
!frame.pointables[4].extended) {
	// Создание луча камера-указательный палец
	var vector = new THREE.Vector3(finger.tipPosition[0], finger.tipPosition[1], finger.tipPosition[2]);
	var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(objects);
	// Если есть пересечения с объектами
	if (intersects.length > 0) {
		// Возвращает номер первого пересеченного объекта 
		return objects.indexOf(intersects[0].object);
	} else {
		// Наведение на объект
		return -1;
	}
}
// Объект выделен
return -2;
}

function updateObj(frame) {
	
var hand = frame.hands[0];
//Если количество жестов больше 0
if (frame.gestures.length > 0) {
for (var i = 0; i < frame.gestures.length; i++) {
// Присваиваем переменной id жеста
var gesture = frame.gestures[i];
// Если жест смахивания
if (gesture.type == "swipe") {
	// Сравнение направления смахивания по горизонтали и вертикали
	var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);	        
	// Если одна рука
	if (frame.hands.length < 2){
		// Если смахивание слева направо и наоборот, то перемещаем объект по оси X
		if(isHorizontal){
			if(gesture.direction[0] > 0){
				objects[lastindex].position.x += 2;
				objects[lastindex].__dirtyPosition = true;
			} else {
				objects[lastindex].position.x -= 2;
				objects[lastindex].__dirtyPosition = true;
			}
		} else {
			// Если смахивание сверху вниз и наоборот, то перемещаем объект по оси Y
			if(gesture.direction[1] > 0){
				objects[lastindex].position.y += 2;
				objects[lastindex].__dirtyPosition = true;
			} else {
				objects[lastindex].position.y -= 2;
				objects[lastindex].__dirtyPosition = true;
			}                  
		}
	} else if (frame.hands.length > 1) { // Если распознается больше одной руки
		// Если смахивание сверху вниз и наоборот, то перемещаем объект по оси Z
		if(gesture.direction[1] > 0){
			objects[lastindex].position.z -= 2;
			objects[lastindex].__dirtyPosition = true;
		} else {
			objects[lastindex].position.z += 2;
			objects[lastindex].__dirtyPosition = true;
		}      
	}
} else if(gesture.type == "circle") { // Если жест кругового движения пальцев
	// Определение вращения по часовой или против часовой
	var pointableID = gesture.pointableIds[0];
	var direction = frame.pointable(pointableID).direction;
	var dotProduct = Leap.vec3.dot(direction, gesture.normal);
	// Если распознается одна рука 
	if (frame.hands.length < 2){
		// Если вращение правой рукой, то вращается объект по оси Z 
		if (hand.type == "right"){
			if (dotProduct  <  0) {
				objects[lastindex].rotation.z += 0.005;
				objects[lastindex].__dirtyRotation = true;
			} else {
				objects[lastindex].rotation.z -= 0.005;
				objects[lastindex].__dirtyRotation = true;
			}
		} else if (hand.type == "left"){ // Если вращение левой рукой, то вращается объект по оси Y 
			if (dotProduct  <  0) {
				objects[lastindex].rotation.y += 0.005;
				objects[lastindex].__dirtyRotation = true;
			} else {
				objects[lastindex].rotation.y -= 0.005;
				objects[lastindex].__dirtyRotation = true;
			}
		}
	} else if (frame.hands.length > 1) { // Если распознается больше одной руки, то вращается объект по оси X
		if (dotProduct  <  0) {
			objects[lastindex].rotation.x += 0.005;
			objects[lastindex].__dirtyRotation = true;
		} else {
			objects[lastindex].rotation.x -= 0.005;
			objects[lastindex].__dirtyRotation = true;
		}
	}
}
}
}
}


function addMesh( meshes ) {
	var geometry = new THREE.BoxGeometry( 0.5, 0.5, 1 );
	var material = new THREE.MeshLambertMaterial({color: 0xfec56d});
	var mesh = new THREE.Mesh(geometry, material);
	meshes.push( mesh );
	return mesh;

}

function updateMesh( bone, mesh ) {
	mesh.position.fromArray( bone.center() );
	mesh.setRotationFromMatrix( ( new THREE.Matrix4 ).fromArray( bone.matrix() ) );
	mesh.scale.set( bone.width, bone.width, bone.length );
	scene.add( mesh );
}
