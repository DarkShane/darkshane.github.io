function setContainer() {
    const img = new Image();
    img.src = 'img/ep.jpg';

    img.onload = function() {
        const mapContainer = document.getElementById('map-container');
        const canvas = document.getElementById('map-canvas');
        const context = canvas.getContext('2d');
        
        const dot = document.getElementById('dot-container');

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let translateX = 0;
        let translateY = 0;
        const scaleFactor = 1.1;
        
        mapContainer.style.width = `${img.width}px`;
        mapContainer.style.height = `${img.height}px`;
        
        canvas.width = img.width;
        canvas.height = img.height;

        fetch('test.csv')
            .then(response => response.text())
            .then(data => {
                const lines = data.trim().split('\n');
                const headers = lines[0].split(';');
                const result = [];

                for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(';');
                const obj = {};

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = values[j];
                }

                result.push(obj);
                }

                console.log(result);
            });

        dot.style.left = 50 + 'px';
        dot.style.top = 100 + 'px';

        drawImage();

        canvas.addEventListener('mousedown', startDragging);
        canvas.addEventListener('mouseup', stopDragging);
        canvas.addEventListener('mousemove', drag);
        canvas.addEventListener('wheel', zoom);
        canvas.addEventListener('dblclick', resetCanvas);

        
        function resetCanvas() {
            console.log(`Reseting canvas!`);
            clearCanvas();
            context.reset();
            drawImage();
        }

        function startDragging(event) {
        if (event.button === 0) {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
        }
        }

        function stopDragging(event) {
        if (event.button === 0) {
            isDragging = false;
            translateX += event.clientX - startX;
            translateY += event.clientY - startY;
        }
        }

        function drag(event) {
            if (isDragging) {
                console.log("Drag event:", event);
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                console.log(`dx: ${dx}, dy: ${dy}`);
            
                clearCanvas();
                translateCanvas(dx, dy);
                drawImage();
                translateX += dx;
                translateY += dy;
            
                console.log(`translateX: ${translateX}, translateY: ${translateY}`);
            
                startX = event.clientX;
                startY = event.clientY;
                console.log(`startX: ${startX}, startY: ${startY}`);
            }
        }

        function zoom(event) {
            event.preventDefault();
            const mousePosX = event.clientX - canvas.offsetLeft;
            const mousePosY = event.clientY - canvas.offsetTop;
            const wheel = event.deltaY < 0 ? scaleFactor : 1 / scaleFactor;
          
            // Apply the new scale value
            clearCanvas();
            scaleCanvas(mousePosX, mousePosY, wheel);
            drawImage();
        }

        function clearCanvas() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        function drawImage() {
            context.drawImage(img, 0, 0);

            const centerX = canvas.width / 2 - translateX;
            const centerY = canvas.height / 2 - translateY;
        }

        function translateCanvas(dx, dy) {
            context.translate(dx, dy);
        }

        function scaleCanvas(mousePosX, mousePosY, zoom) {
            context.translate(mousePosX, mousePosY);
            context.scale(zoom, zoom);
            context.translate(-mousePosX, -mousePosY);
        }
    }
}