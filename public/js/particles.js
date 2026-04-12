export function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Inicialização do Cena, Câmera e Renderizador 3D
    const scene = new THREE.Scene();
    
    // Configurando nevoeiro para profundidade
    scene.fog = new THREE.FogExp2(0x050505, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    // Move a câmera para trás para ver o 3D
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Criando Geometria de Partículas 3D Avançadas
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 1000 : 3000;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        // Distribuição esférica e espalhada
        posArray[i] = (Math.random() - 0.5) * 2000;
        
        // Tamanhos aleatórios para dar noção de proximidade
        if (i % 3 === 0) {
            scaleArray[i/3] = Math.random();
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

    // Material com Shader Personalizado ou PointsMaterial premium
    const particlesMaterial = new THREE.PointsMaterial({
        size: 3,
        color: 0x8B5CF6,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Sistema Escuro e Elegante de Partículas Flutuantes Secundárias
    const particlesGeometry2 = new THREE.BufferGeometry();
    const posArray2 = new Float32Array(1000 * 3);
    for(let i = 0; i < 1000 * 3; i++) {
        posArray2[i] = (Math.random() - 0.5) * 1500;
    }
    particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
    const particlesMaterial2 = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xEC4899,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });
    const particlesMesh2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
    scene.add(particlesMesh2);

    // Interatividade com o Mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Subindo/Descendo o 3D com o Scroll ("Junto com o Render")
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Responsividade
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animação Contínua (Game Loop)
    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        // Faz com que partículas girem lentamente em 3D
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;
        
        particlesMesh2.rotation.y = elapsedTime * -0.03;
        particlesMesh2.rotation.x = elapsedTime * -0.01;

        // Animação Suave com o Mouse
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // *** AQUI ESTÁ O SEGREDO DO "SUBIR COM O SCROLL" ***
        // Move a câmera no eixo Y em coordenação com a rolagem da página!
        camera.position.y = -(scrollY * 0.15); // Efeito Parallax em 3D Real

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    tick();
}
