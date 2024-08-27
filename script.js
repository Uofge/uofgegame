// Основные настройки
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Отключение скролла при касаниях на мобильных устройствах
document.body.style.overflow = 'hidden';
document.body.style.touchAction = 'none'; // Отключаем действия по умолчанию

let backgroundColor = { r: 10, g: 10, b: 10 }; // Темный начальный цвет фона
let colorChangeSpeed = 0.02; // Уменьшенная скорость изменения цвета для более спокойного эффекта
let pulseOffset = 0; // Смещение для эффекта пульсации
let pulseSpeed = 0.01; // Медленнее пульсация для более спокойного освещения

// Переменные для уровней, очков и здоровья
let level = 1; // Текущий уровень
let bonusesCollected = 0; // Счетчик собранных бонусов
let bonusesToNextLevel = 5; // Количество бонусов для перехода на следующий уровень
let score = 0; // Очки игрока
let health = 100; // Шкала здоровья игрока

let gameOver = false; // Переменная для отслеживания состояния игры

// Аудио элементы
const backgroundMusic = document.getElementById('backgroundMusic');
const collectSound = document.getElementById('collectSound');
const explodeSound = document.getElementById('explodeSound');

// Запуск фоновой музыки
backgroundMusic.volume = 0.5;
backgroundMusic.play();

// Устанавливаем размеры холста в зависимости от окна
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Переменные для управления персонажем
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    color: '#BBBBBB', // Более спокойный серый цвет персонажа
    speed: 3, // Уменьшенная скорость персонажа для более спокойного геймплея
    lightRadius: 150, // Радиус света, который освещает пространство вокруг игрока
    targetLightRadius: 150, // Целевой радиус света для плавного расширения
};

let isTouching = false;
let touchOffsetX = 0;
let touchOffsetY = 0;

// Массив для хранения препятствий, бонусов, врагов, частиц и звезд
let obstacles = [];
let bonuses = [];
let enemies = [];
let particles = [];
let stars = [];
let difficulty = 1;

// Функция для создания звезд для анимации фона
function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.2 + 0.05 // Уменьшенная скорость для более спокойной атмосферы
        });
    }
}

// Функция для обновления и отрисовки звезд
function drawStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = '#888'; // Спокойный серый цвет для звезд
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

// Функция для обновления цвета фона
function updateBackgroundColor() {
    backgroundColor.r += colorChangeSpeed * level; // Увеличиваем скорость смены цвета в зависимости от уровня
    backgroundColor.g += (colorChangeSpeed / 2) * level;
    backgroundColor.b += (colorChangeSpeed / 3) * level;

    if (backgroundColor.r > 40) backgroundColor.r = 10;
    if (backgroundColor.g > 40) backgroundColor.g = 10;
    if (backgroundColor.b > 40) backgroundColor.b = 10;

    ctx.fillStyle = `rgb(${Math.floor(backgroundColor.r)}, ${Math.floor(backgroundColor.g)}, ${Math.floor(backgroundColor.b)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Функция для создания препятствий с начальной непрозрачностью и случайным цветом
function createObstacle() {
    const size = Math.random() * 40 + 20; // Размеры препятствий
    const obstacle = {
        x: Math.random() * (canvas.width - size),
        y: Math.random() * (canvas.height - size),
        width: size,
        height: size,
        color: getRandomDarkColor(), // Используем темные цвета для препятствий
        opacity: 0, // Начальная непрозрачность для плавного появления
        targetOpacity: 0, // Целевая непрозрачность
        isDestroyed: false, // Флаг для проверки, что препятствие разрушено
        speedX: (Math.random() - 0.5) * 1.5, // Уменьшенная скорость движения по X
        speedY: (Math.random() - 0.5) * 1.5 // Уменьшенная скорость движения по Y
    };
    obstacles.push(obstacle);
}

// Функция для создания врагов, которые преследуют игрока
function createEnemy() {
    const size = Math.random() * 30 + 20; // Размеры врагов
    const enemy = {
        x: Math.random() * (canvas.width - size),
        y: Math.random() * (canvas.height - size),
        width: size,
        height: size,
        color: '#FF4444', // Красный цвет для врагов
        opacity: 1,
        speed: Math.random() * 1 + 0.5 // Уменьшенная скорость врагов
    };
    enemies.push(enemy);
}

// Функция для генерации случайного темного цвета
function getRandomDarkColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    // Преобразуем в темный цвет
    return `#${color}`.replace(/./g, (c, i) => i ? c : '0');
}

// Функция для создания бонусов
function createBonus() {
    const bonus = {
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 20),
        width: 20,
        height: 20,
        color: '#FFFF99' // Теплый, но спокойный желтый цвет для бонусов
    };
    bonuses.push(bonus);
}

// Создаем несколько начальных препятствий, бонусов и врагов
for (let i = 0; i < 5; i++) {
    createObstacle();
    createBonus();
}
createEnemy(); // Создаем первого врага
createStars(); // Создаем звезды для фона

// Функция отрисовки игрока
function drawPlayer() {
    // Обновляем радиус света с пульсацией и плавным расширением
    pulseOffset = Math.sin(performance.now() * pulseSpeed) * 5;
    player.lightRadius += (player.targetLightRadius - player.lightRadius) * 0.1;
    let currentLightRadius = player.lightRadius + pulseOffset;

    // Создаем градиент для света
    let gradient = ctx.createRadialGradient(
        player.x + player.width / 2, 
        player.y + player.height / 2, 
        10, 
        player.x + player.width / 2, 
        player.y + player.height / 2, 
        currentLightRadius
    );
    
    gradient.addColorStop(0, 'rgba(200, 200, 200, 1)');
    gradient.addColorStop(0.7, 'rgba(200, 200, 200, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    // Отрисовываем свет вокруг игрока
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовываем самого игрока
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Функция отрисовки препятствий, видимых в радиусе света
function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (!obstacle.isDestroyed) {
            const distance = Math.sqrt(
                Math.pow((player.x + player.width / 2) - (obstacle.x + obstacle.width / 2), 2) +
                Math.pow((player.y + player.height / 2) - (obstacle.y + obstacle.height / 2), 2)
            );

            if (distance <= player.lightRadius + obstacle.width / 2) {
                obstacle.targetOpacity = 1; // Устанавливаем целевую непрозрачность на 1, если в пределах света
            } else {
                obstacle.targetOpacity = 0; // Устанавливаем целевую непрозрачность на 0, если вне света
            }

            // Плавное изменение непрозрачности к целевому значению
            obstacle.opacity += (obstacle.targetOpacity - obstacle.opacity) * 0.1;

            // Обновляем положение препятствия
            obstacle.x += obstacle.speedX;
            obstacle.y += obstacle.speedY;

            // Проверяем столкновение с краем экрана и меняем направление
            if (obstacle.x < 0 || obstacle.x + obstacle.width > canvas.width) obstacle.speedX *= -1;
            if (obstacle.y < 0 || obstacle.y + obstacle.height > canvas.height) obstacle.speedY *= -1;

            ctx.globalAlpha = obstacle.opacity; // Применяем текущую непрозрачность
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
    ctx.globalAlpha = 1; // Восстанавливаем прозрачность для других элементов
}

// Функция отрисовки врагов
function drawEnemies() {
    enemies.forEach(enemy => {
        // Преследование игрока
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }

        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Функция отрисовки бонусов (всегда видимы)
function drawBonuses() {
    bonuses.forEach(bonus => {
        ctx.fillStyle = bonus.color;
        ctx.beginPath();
        ctx.arc(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2, bonus.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Функция для создания частиц
function createParticles(x, y, color) {
    const particleCount = 50; // Увеличиваем количество частиц
    const maxSize = 10; // Увеличиваем размер частиц

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4, // Рандомное движение частиц
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * maxSize + 5, // Рандомизация размера частиц
            color: color,
            life: 150 // Увеличиваем продолжительность жизни частиц
        });
    }
}

// Функция для отрисовки и обновления частиц
function drawParticles() {
    particles.forEach((particle, index) => {
        if (particle.life > 0) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 150; // Плавное исчезновение частиц
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

            // Обновляем позицию и уменьшаем жизнь частицы
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            // Уменьшаем размер частицы по мере исчезновения
            particle.size *= 0.97;
        } else {
            particles.splice(index, 1);
        }
    });
    ctx.globalAlpha = 1; // Восстанавливаем прозрачность для других элементов
}

// Проверка столкновений игрока с препятствиями, врагами и бонусами
function checkCollisions() {
    // Проверяем столкновения с препятствиями
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        if (
            !obstacle.isDestroyed &&
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            // Если игрок столкнулся с препятствием, уменьшаем радиус света
            player.targetLightRadius = Math.max(50, player.lightRadius - 20); // Используем targetLightRadius для плавного уменьшения
            obstacle.isDestroyed = true; // Помечаем препятствие как разрушенное
            createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.color); // Создаем эффект рассыпания
            explodeSound.play(); // Воспроизводим звук разрушения
            setTimeout(() => {
                obstacles.splice(i, 1); // Удаляем препятствие через время
                createObstacle(); // Создаем новое препятствие
            }, 500); // Время задержки перед удалением препятствия
        }
    }

    // Проверяем столкновения с врагами
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // Если враг касается игрока, уменьшаем радиус света и здоровье
            player.targetLightRadius = Math.max(50, player.lightRadius - 30); // Используем targetLightRadius для плавного уменьшения
            health -= 1; // Уменьшаем здоровье на 1%
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#FF4444'); // Эффект столкновения с врагом

            if (health <= 0) {
                endGame(); // Завершение игры, если здоровье достигло 0
            }
        }
    }

    // Проверяем столкновения с бонусами
    for (let i = 0; i < bonuses.length; i++) {
        const bonus = bonuses[i];
        if (
            player.x < bonus.x + bonus.width &&
            player.x + player.width > bonus.x &&
            player.y < bonus.y + bonus.height &&
            player.y + player.height > bonus.y
        ) {
            player.targetLightRadius = Math.min(300, player.lightRadius + 30); // Используем targetLightRadius для плавного увеличения
            bonusesCollected++; // Увеличиваем счетчик собранных бонусов
            score += 10; // Увеличиваем очки за каждый собранный бонус
            collectSound.play(); // Воспроизводим звук сбора бонуса
            bonuses.splice(i, 1); // Удаляем бонус
            createBonus(); // Создаем новый бонус

            // Переход на следующий уровень, если достигнуто нужное количество бонусов
            if (bonusesCollected >= bonusesToNextLevel) {
                levelUp();
            }
        }
    }
}

// Переход на следующий уровень
function levelUp() {
    level++;
    bonusesCollected = 0; // Сбрасываем счетчик бонусов
    bonusesToNextLevel += 5; // Увеличиваем требуемое количество бонусов для следующего уровня

    // Увеличиваем сложность: больше препятствий, врагов и бонусов
    for (let i = 0; i < level; i++) {
        createObstacle();
        createBonus();
        if (i % 2 === 0) createEnemy(); // Добавляем врагов на каждом втором уровне
    }

    // Увеличиваем скорость смены фона для большей динамики
    colorChangeSpeed += 0.01;
}

// Функция завершения игры
function endGame() {
    gameOver = true;
    backgroundMusic.pause(); // Останавливаем музыку

    // Отрисовываем сообщение о завершении игры
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = '#FF4444';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 50);
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('Your Score: ' + score, canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Tap to Restart', canvas.width / 2 - 100, canvas.height / 2 + 50);

    // Добавляем слушатель для перезапуска игры
    canvas.addEventListener('click', restartGame);
}

// Функция перезапуска игры
function restartGame() {
    // Сбрасываем все параметры
    level = 1;
    bonusesCollected = 0;
    bonusesToNextLevel = 5;
    score = 0;
    health = 100;
    gameOver = false;
    backgroundMusic.play();

    // Очищаем массивы объектов
    obstacles = [];
    bonuses = [];
    enemies = [];
    particles = [];

    // Создаем начальные объекты
    for (let i = 0; i < 5; i++) {
        createObstacle();
        createBonus();
    }
    createEnemy(); // Создаем первого врага
    createStars(); // Создаем звезды для фона

    // Убираем слушатель для перезапуска игры
    canvas.removeEventListener('click', restartGame);

    // Перезапуск игрового цикла
    gameLoop();
}

// Функция для отображения очков и здоровья на экране
function drawScoreAndHealth() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Level: ' + level, 10, 60);
    ctx.fillStyle = '#FF4444';
    ctx.fillText('Health: ' + health + '%', 10, 90);
}

// Обработка касания
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // Проверяем, попал ли палец на игрока
    if (touchX >= player.x && touchX <= player.x + player.width && touchY >= player.y && touchY <= player.y + player.height) {
        isTouching = true;
        touchOffsetX = touchX - player.x;
        touchOffsetY = touchY - player.y;
    }
});

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (isTouching) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        // Обновляем положение игрока
        player.x = touchX - touchOffsetX;
        player.y = touchY - touchOffsetY;
    }
});

canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    isTouching = false;
});

// Основной игровой цикл
function gameLoop() {
    if (!gameOver) {
        updateBackgroundColor(); // Обновляем цвет фона
        drawStars(); // Отрисовываем анимацию звезд
        drawPlayer();
        drawObstacles();
        drawEnemies(); // Отрисовываем врагов
        drawBonuses();
        drawParticles();
        drawScoreAndHealth(); // Отображаем очки и здоровье
        checkCollisions();
        requestAnimationFrame(gameLoop);
    }
}

// Запуск игры
gameLoop();
