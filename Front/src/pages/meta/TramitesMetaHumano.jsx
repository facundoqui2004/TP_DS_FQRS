import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import MetahumanoLayout from "../../components/layouts/MetahumanoLayout"
import { Meta } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showFormPowers, setShowFormPowers] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState("");
  const [poderes, setPoderes] = useState([]);
  const [misPoderes, setMisPoderes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Nuevos estados para Estilo de Vida, Solicitud Enemigos y Permiso Destrucción
  const [metahumanoDetails, setMetahumanoDetails] = useState(null);
  const [showFormLifestyle, setShowFormLifestyle] = useState(false);
  const [lifestyleRole, setLifestyleRole] = useState("HEROE");
  const [nivelFama, setNivelFama] = useState("Bajo");
  const [mision, setMision] = useState("");
  const [nivelPeligrosidad, setNivelPeligrosidad] = useState("Baja");
  const [motivacion, setMotivacion] = useState("");
  const [recompensa, setRecompensa] = useState("");

  const [showFormEnemy, setShowFormEnemy] = useState(false);
  const [villanosList, setVillanosList] = useState([]);
  const [selectedVillanoId, setSelectedVillanoId] = useState("");
  const [enemyDescription, setEnemyDescription] = useState("");

  const [showFormDestruction, setShowFormDestruction] = useState(false);
  const [destructionMotivo, setDestructionMotivo] = useState("");
  const [destructionZona, setDestructionZona] = useState("");
  const [destructionDanos, setDestructionDanos] = useState("");
  const [destructionLat, setDestructionLat] = useState(null);
  const [destructionLng, setDestructionLng] = useState(null);
  const destructionMapRef = useRef(null);
  const destructionMarkerRef = useRef(null);
  const [incomingEnemyRequests, setIncomingEnemyRequests] = useState([]);

  // Obtener datos del usuario
  const { 
    user, 
    isAuthenticated, 
    getUserId, 
    getPerfilId, 
    getUserRole, 
    getUserAlias,
    refreshProfile
  } = useAuth();

  // Obtener perfil completo del metahumano
  const fetchPerfilMetahumano = useCallback(async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMetahumanoDetails(data.usuario?.metahumano || null);
        console.log('Detalles del Metahumano cargados:', data.usuario?.metahumano);
      }
    } catch (err) {
      console.error('Error fetching metahumano profile details:', err);
    }
  }, [getUserId]);

  // Cargar lista de villanos para solicitud de enemigos
  const fetchVillanos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/villanos', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVillanosList(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching villanos:', err);
    }
  };

  // Cargar solicitudes de enemigo entrantes para villanos
  const fetchIncomingEnemyRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/villanos/solicitudes-enemigo', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIncomingEnemyRequests(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching incoming enemy requests:', err);
    }
  };


  // Responder a solicitud de enemigo
  const handleResponderSolicitudEnemigo = async (carpetaId, respuesta) => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      const response = await fetch(`http://localhost:3000/api/villanos/solicitudes-enemigo/${carpetaId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ respuesta })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al responder la solicitud');
      }
      
      setSuccessMessage(`Solicitud de enemigo ${respuesta === 'ACEPTAR' ? 'aceptada' : 'rechazada'} con éxito!`);
      await fetchIncomingEnemyRequests();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil al montar o cambiar autenticacion
  useEffect(() => {
    if (isAuthenticated) {
      fetchPerfilMetahumano();
    }
  }, [isAuthenticated, fetchPerfilMetahumano]);

  // Cargar solicitudes de enemigo si el metahumano es un villano
  useEffect(() => {
    if (metahumanoDetails?.tipoMeta === 'villano') {
      fetchIncomingEnemyRequests();
    }
  }, [metahumanoDetails]);

  // Manejar inicialización y destrucción del mapa del trámite de destrucción
  useEffect(() => {
    if (showFormDestruction) {
      const timer = setTimeout(() => {
        const container = document.getElementById("destruction-map");
        if (container && !destructionMapRef.current) {
          const defaultLat = -32.9468;
          const defaultLng = -60.6393;
          const initialLat = destructionLat || defaultLat;
          const initialLng = destructionLng || defaultLng;

          const map = L.map("destruction-map").setView([initialLat, initialLng], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          }).addTo(map);

          destructionMapRef.current = map;

          const icon = L.divIcon({
            html: `<div style="font-size: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">💥</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          if (destructionLat && destructionLng) {
            destructionMarkerRef.current = L.marker([destructionLat, destructionLng], { icon }).addTo(map);
          }

          map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            setDestructionLat(lat);
            setDestructionLng(lng);

            if (destructionMarkerRef.current) {
              destructionMarkerRef.current.setLatLng([lat, lng]);
            } else {
              destructionMarkerRef.current = L.marker([lat, lng], { icon }).addTo(map);
            }
          });
        }
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } else {
      if (destructionMapRef.current) {
        destructionMapRef.current.remove();
        destructionMapRef.current = null;
        destructionMarkerRef.current = null;
      }
    }
  }, [showFormDestruction]);

  // Definir estilo de vida (Héroe o Villano)
  const handleDefinirEstiloVida = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const payload = {
        tipoMeta: lifestyleRole,
        ...(lifestyleRole === 'HEROE' 
          ? { nivelFama, mision, numeroVictorias: 0, estatus: 'activo' }
          : { nivelPeligrosidad, motivacion, recompensa: Number(recompensa) || 0, estado: 'activo' })
      };
      
      const response = await fetch('http://localhost:3000/api/metahumanos/estilo-vida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al definir estilo de vida');
      }
      
      setSuccessMessage(`🎉 ¡Estilo de vida definido exitosamente como ${lifestyleRole}!`);
      setShowFormLifestyle(false);
      await fetchPerfilMetahumano();
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Solicitar Asignación de Enemigo
  const handleSolicitarEnemigo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      if (!selectedVillanoId) {
        throw new Error("Debes seleccionar un villano");
      }
      
      const response = await fetch('http://localhost:3000/api/heroes/solicitud-enemigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          villanoId: Number(selectedVillanoId),
          descripcion: enemyDescription
        })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al solicitar enemigo');
      }
      
      setSuccessMessage("✅ Solicitud de enemigo enviada exitosamente!");
      setShowFormEnemy(false);
      setSelectedVillanoId("");
      setEnemyDescription("");
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Solicitar Rehabilitación de Villano
  const handleSolicitarRehabilitacion = async () => {
    try {
      const confirmRehab = window.confirm("¿Estás seguro de que deseas iniciar tu trámite de rehabilitación para convertirte en Héroe?");
      if (!confirmRehab) return;
      
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const response = await fetch('http://localhost:3000/api/villanos/tramite-rehabilitacion', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al solicitar rehabilitación');
      }
      
      setSuccessMessage("🕊️ ¡Trámite de rehabilitación iniciado con éxito! Tu estado ahora es 'rehabilitando'.");
      await fetchPerfilMetahumano();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Solicitar Permiso de Destrucción
  const handleSolicitarPermisoDestruccion = async (e) => {
    e.preventDefault();
    if (!destructionLat || !destructionLng) {
      setError("Por favor, selecciona una ubicación en el mapa haciendo clic sobre él.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      
      const response = await fetch('http://localhost:3000/api/villanos/permisos-destruccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          motivo: destructionMotivo,
          zonaAfectada: destructionZona,
          descripcionDanos: destructionDanos,
          latitud: destructionLat,
          longitud: destructionLng
        })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al solicitar permiso');
      }
      
      setSuccessMessage("💥 Solicitud de permiso de destrucción enviada exitosamente!");
      setShowFormDestruction(false);
      setDestructionMotivo("");
      setDestructionZona("");
      setDestructionDanos("");
      setDestructionLat(null);
      setDestructionLng(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // obtener poderes del backend
  const fetchPoderes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // Obtener todos los poderes
      const response = await fetch('http://localhost:3000/api/poderes', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener los poderes');
      }
      
      const data = await response.json();
      let todosLosPoderes = data.data || [];
      
      // Obtener los poderes que ya tiene el usuario
      try {
        const userId = getUserId();
        if (userId) {
          const userResponse = await fetch(`http://localhost:3000/api/metapoderes/usuario/${userId}`, {
            credentials: 'include'
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const metahumanoId = userData.usuario?.metahumano?.id;
            
            if (metahumanoId) {
              const misPoderesResponse = await fetch(`http://localhost:3000/api/metapoderes/${metahumanoId}`, {
                credentials: 'include'
              });
              if (misPoderesResponse.ok) {
                const misPoderesData = await misPoderesResponse.json();
                const poderesMios = misPoderesData.data || misPoderesData || [];
                
                // Filtrar poderes que ya tiene APROBADOS o SOLICITADOS
                const poderesYaTengo = poderesMios
                  .filter(mp => mp.estado === 'APROBADO' || mp.estado === 'SOLICITADO')
                  .map(mp => mp.poder?.id);
                
                todosLosPoderes = todosLosPoderes.filter(poder => 
                  !poderesYaTengo.includes(poder.id)
                );
              }
            }
          }
        }
      } catch (filterError) {
        console.log('Error filtrando poderes:', filterError);
      }
      
      setPoderes(todosLosPoderes);
    } catch (err) {
      setError('No se pudieron cargar los poderes disponibles');
      console.error('Error fetching poderes:', err);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // obtener los metapoderes del usuario
  const fetchMisPoderes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // Obtener userId desde el contexto
      const userId = getUserId();
      if (!userId) {
        setError('No se pudo obtener la información del usuario');
        return;
      }

      console.log(' Obteniendo datos del usuario ID:', userId);

      // Obtener datos completos del usuario para extraer metahumanoId
      const userResponse = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const userData = await userResponse.json();
      console.log('Datos del usuario:', userData);
      
      const metahumanoId = userData.usuario?.metahumano?.id;
      
      if (!metahumanoId) {
        setError('No se encontró el perfil de metahumano. Verifica que tu cuenta esté configurada correctamente.');
        console.error('No se encontró metahumano.id en:', userData);
        return;
      }

      console.log('Obteniendo metapoderes para metahumanoId:', metahumanoId);

      // Obtener los metapoderes del usuario
      const response = await fetch(`http://localhost:3000/api/metapoderes/${metahumanoId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Si no encuentra metapoderes, establecer array vacío
          console.log('No se encontraron metapoderes para este usuario');
          setMisPoderes([]);
          return;
        }
        throw new Error('Error al obtener tus poderes');
      }
      
      const data = await response.json();
      console.log('Metapoderes obtenidos:', data);
      
      const poderes = data.data || data || [];
      setMisPoderes(Array.isArray(poderes) ? poderes : []);
      
    } catch (err) {
      setError(`No se pudieron cargar tus poderes: ${err.message}`);
      console.error('Error fetching mis poderes:', err);
      setMisPoderes([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Función para solicitar un poder
const solicitarPoder = async (poder) => {
  try {
    setLoading(true);
    setError("");
    
    // Verificar autenticación
    if (!isAuthenticated || !user) {
      setError('Debes iniciar sesión para solicitar poderes');
      return;
    }

    // Verificar que es un metahumano
    const userRole = getUserRole();
    if (userRole !== 'METAHUMANO') {
      setError('Solo los metahumanos pueden solicitar poderes');
      return;
    }

    // Obtener datos del usuario
    const userId = getUserId();
    const alias = getUserAlias();

    console.log('Datos del usuario para solicitud:', {
      userId,
      userRole,
      alias,
      user
    });

    if (!userId) {
      setError('No se pudo obtener la información del usuario');
      return;
    }

    // Obtener el ID del metahumano
    console.log('Obteniendo datos del usuario...');
    const userResponse = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
      credentials: 'include'
    });

    if (!userResponse.ok) {
      throw new Error('Error al obtener los datos del usuario');
    }

    const userData = await userResponse.json();
    console.log('Datos completos del usuario:', userData);

    const metahumanoId = userData.usuario?.metahumano?.id;
    
    if (!metahumanoId) {
      setError('No se pudo obtener el ID del metahumano. Verifica que tu perfil esté completo.');
      console.error('No se encontró metahumano.id en:', userData);
      return;
    }

    console.log('ID del metahumano obtenido:', metahumanoId);

    // Verificar si el metahumano ya tiene este poder
    console.log('Verificando si ya tienes este poder...');
    const checkResponse = await fetch(`http://localhost:3000/api/metapoderes/${metahumanoId}`, {
      credentials: 'include'
    });

    if (checkResponse.ok) {
      const existingPowers = await checkResponse.json();
      const poderes = existingPowers.data || existingPowers || [];
      
      // Verifica si ya tiene el poder (aprobado o solicitado)
      if (misPoderes.length > 0){
          const yaTienePoder = poderes.some(mp => 
          mp.poder?.id === poder.id && (mp.estado === 'APROBADO' || mp.estado === 'SOLICITADO')
        );

        if (yaTienePoder) {
          setError(`Ya tienes el poder "${poder.nomPoder}" asignado o en proceso de solicitud.`);
          return;
        }
      }
    }

    // Preparar los datos completos para la asignación de metapoder
    const asignacionData = {
      metahumanoId: parseInt(metahumanoId),
      poderId: parseInt(poder.id),
      dominio: "NOVATO", 
      nivelControl: 25, 
      estado: "SOLICITADO", 
      fechaAdquisicion: new Date().toISOString().split('T')[0] 
    };

    console.log('Enviando solicitud de metapoder:', asignacionData);
    console.log('Poder seleccionado:', poder.nomPoder);
    
    const response = await fetch('http://localhost:3000/api/metapoderes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // incluye cookies
      body: JSON.stringify(asignacionData),
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('Error del servidor:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        console.log('No se pudo parsear el error como JSON');
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Metapoder asignado exitosamente:', result);
    
    // Mostrar mensaje de éxito con más detalles
    setSuccessMessage(
      `¡Éxito! Has solicitado el poder "${poder.nomPoder}". Estado: SOLICITADO`
    );
    setError(""); // Limpiar errores previos
    
    // Recargar la lista de poderes disponibles para reflejar los cambios
    await fetchPoderes();
    
    // Limpiar el mensaje de éxito después de 5 segundos
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
    
  } catch (err) {
    setError(`Error al solicitar el poder: ${err.message}`);
    console.error('Error solicitando poder:', err);
  } finally {
    setLoading(false);
  }
};

  // Función para desactivar/eliminar un poder
  const desactivarPoder = async (metapoderId, nombrePoder) => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Desactivando metapoder ID:', metapoderId);
      
      if (!metapoderId) {
        setError('ID del metapoder no válido');
        return;
      }
      
      // Confirmar la acción
      const confirmar = window.confirm(`¿Estás seguro de que quieres desactivar el poder "${nombrePoder}"?`);
      if (!confirmar) {
        return;
      }
      
      // Enviar petición para desactivar el poder (cambiar estado a INACTIVO)
      const response = await fetch(`http://localhost:3000/api/metapoderes/${metapoderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          estado: 'INACTIVO'
        }),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('Error del servidor:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          console.log('No se pudo parsear el error como JSON');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Poder desactivado exitosamente:', result);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`¡Poder "${nombrePoder}" desactivado exitosamente!`);
      setError(""); // Limpiar errores previos
      
      // Recargar la lista de poderes
      await fetchMisPoderes();
      
      // Si estamos en la vista de solicitar, también recargar poderes disponibles
      if (tipoSolicitud === "solicitar") {
        await fetchPoderes();
      }
      
      // Limpiar el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
    } catch (err) {
      setError(`Error al desactivar el poder: ${err.message}`);
      console.error('Error desactivando poder:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos según el tipo de solicitud
  useEffect(() => {
    if (tipoSolicitud) {
      // Verificar autenticación antes de cargar datos
      if (!isAuthenticated) {
        setError('Debes iniciar sesión para acceder a esta función');
        return;
      }
      
      if (getUserRole() !== 'METAHUMANO') {
        setError('Solo los metahumanos pueden acceder a esta función');
        return;
      }
      
      // Cargar datos según el tipo de solicitud
      if (tipoSolicitud === "solicitar") {
        fetchPoderes(); // Cargar poderes disponibles
      } else if (tipoSolicitud === "eliminar" || tipoSolicitud === "verificar") {
        fetchMisPoderes(); // Cargar mis poderes
      }
    }
  }, [tipoSolicitud, isAuthenticated, getUserRole, fetchPoderes, fetchMisPoderes]);

  const togglePowersForm = () => {
    setShowFormPowers(!showFormPowers);
    // Limpiar errores y mensajes al cerrar/abrir el formulario
    if (!showFormPowers) {
      setError("");
      setSuccessMessage("");
      setTipoSolicitud("");
      setPoderes([]);
      setMisPoderes([]);
    }
  }

  // Función para cambiar tipo de solicitud con limpieza automática
  const cambiarTipoSolicitud = (tipo) => {
    setTipoSolicitud(tipo);
    setError("");
    setSuccessMessage("");
    setPoderes([]);
    setMisPoderes([]);
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    if (showUser) {
      setShowUser(false);
    }
  };
  
  const toggleUser = () => setShowUser(!showUser);
  const closeUser = () => setShowUser(false);

  // Función de debug para consola
  window.debugTramites = {
    fetchPoderes,
    fetchMisPoderes,
    desactivarPoder,
    solicitarPoder,
    cambiarTipoSolicitud,
    getUserId,
    getUserRole,
    user,
    isAuthenticated,
    poderes,
    misPoderes,
    tipoSolicitud,
    loading,
    error,
    successMessage
  };

  // Verificar autenticación en el componente
  if (!isAuthenticated) {
    return (
      <div className="bg-[#545877] w-full min-h-screen flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 max-w-md mx-4">
          <p className="text-red-200 text-center">
            <span className="mr-2">🔒</span>
            Debes iniciar sesión para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  const currentTheme = showFormLifestyle ? lifestyleRole.toLowerCase() : (metahumanoDetails?.tipoMeta || "");
  const containerBg = currentTheme === 'heroe' || currentTheme === 'heróe'
    ? 'bg-red-950/45 border border-red-800/30 backdrop-blur-md'
    : currentTheme === 'villano'
    ? 'bg-zinc-950/75 border border-zinc-800/40 backdrop-blur-md'
    : 'bg-[#296588]';
  const headerBg = currentTheme === 'heroe' || currentTheme === 'heróe'
    ? 'bg-red-900/40 border border-red-800/30'
    : currentTheme === 'villano'
    ? 'bg-zinc-900/60 border border-zinc-800/20'
    : 'bg-[#044b97]';

  return (
      <MetahumanoLayout theme={currentTheme}>
        {/* Contenido principal */}
        <div
          className={`p-4 ${containerBg} text-white rounded-lg shadow-lg h-full hover:shadow-xl transition-all duration-500
            ${showUser ? "lg:col-span-6" : "lg:col-span-8"}
            ${showUser ? "opacity-90" : "opacity-100"}`}
        >
          <div className="flex-1 min-h-full">
            <div className={`p-6 ${headerBg} text-white text-2xl text-bold rounded-lg h-full flex flex-col justify-center items-center transition-all duration-500`}>
                <h1>Panel de Tramites Metahumano</h1>
                {/* Mostrar información del usuario */}
                {user && (
                  <p className="text-lg mt-2 opacity-80">
                    Bienvenido, {getUserAlias() || user.nombre || 'Metahumano'}
                  </p>
                )}
            </div>
            </div>
            
            {metahumanoDetails && metahumanoDetails.tipoMeta !== 'metahumano' && (
              <div className="mt-4 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl inline-flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-300">Estilo de vida actual:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  metahumanoDetails.tipoMeta === 'heroe' 
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                    : 'bg-red-600/30 text-red-300 border border-red-500/30'
                }`}>
                  {metahumanoDetails.tipoMeta === 'heroe' ? '🦸‍♂️ Héroe' : '🦹 Villano'}
                </span>
                {metahumanoDetails.tipoMeta === 'heroe' && metahumanoDetails.nivelFama && (
                  <span className="text-xs text-gray-400 bg-slate-900 px-2 py-0.5 rounded">• Fama: <strong>{metahumanoDetails.nivelFama}</strong></span>
                )}
                {metahumanoDetails.tipoMeta === 'heroe' && metahumanoDetails.mision && (
                  <span className="text-xs text-gray-400 bg-slate-900 px-2 py-0.5 rounded">• Misión: <strong>{metahumanoDetails.mision}</strong></span>
                )}
                {metahumanoDetails.tipoMeta === 'villano' && metahumanoDetails.nivelPeligrosidad && (
                  <span className="text-xs text-gray-400 bg-slate-900 px-2 py-0.5 rounded">• Peligrosidad: <strong>{metahumanoDetails.nivelPeligrosidad}</strong></span>
                )}
                {metahumanoDetails.tipoMeta === 'villano' && metahumanoDetails.estado && (
                  <span className="text-xs text-gray-400 bg-slate-900 px-2 py-0.5 rounded">• Estado: <strong>{metahumanoDetails.estado}</strong></span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Botón Gestión de Poderes */}
              <button 
                onClick={togglePowersForm}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-500/30 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-left">Gestión de Poderes</h2>
                    <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center group-hover:bg-blue-400/50 transition-colors">
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm text-left leading-relaxed">
                    Solicita y cancelar poderes de manera sencilla.
                  </p>
                </div>
              </button>

              {/* Botones condicionales según el rol / tipoMeta */}
              {(!metahumanoDetails || metahumanoDetails.tipoMeta === 'metahumano') && (
                /* Botón Definir Estilo de Vida */
                <button 
                  onClick={() => {
                    setShowFormLifestyle(true);
                    setShowFormPowers(false);
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-500/30 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-left">Definir Estilo de Vida</h2>
                      <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center group-hover:bg-purple-400/50 transition-colors">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                    <p className="text-purple-100 text-sm text-left leading-relaxed">
                      Determine si que tipo de vida llevara su metahumano. (Ej: Heroe, Villano)
                    </p>
                  </div>
                </button>
              )}

              {metahumanoDetails && metahumanoDetails.tipoMeta === 'heroe' && (
                /* Botón Solicitar Asignación de Enemigo */
                <button 
                  onClick={() => {
                    setShowFormEnemy(true);
                    setShowFormPowers(false);
                    fetchVillanos();
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-indigo-500/30 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-left">🎯 Solicitar Enemigo</h2>
                      <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center group-hover:bg-indigo-400/50 transition-colors">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                    <p className="text-indigo-100 text-sm text-left leading-relaxed">
                      Solicita formalmente la asignación oficial de un Villano como tu archienemigo.
                    </p>
                  </div>
                </button>
              )}

              {metahumanoDetails && metahumanoDetails.tipoMeta === 'villano' && (
                <>
                  {/* Botón Solicitar Permiso de Destrucción */}
                  <button 
                    onClick={() => {
                      setShowFormDestruction(true);
                      setShowFormPowers(false);
                    }}
                    className="group relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-500/30 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-left">💥 Permiso de Destrucción</h2>
                        <div className="w-8 h-8 bg-amber-500/30 rounded-full flex items-center justify-center group-hover:bg-amber-400/50 transition-colors">
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                      <p className="text-amber-100 text-sm text-left leading-relaxed">
                        Solicita autorizaciones gubernamentales para daños colaterales estimados en combates.
                      </p>
                    </div>
                  </button>

                  {/* Botón Trámite de Rehabilitación */}
                  <button 
                    onClick={handleSolicitarRehabilitacion}
                    disabled={metahumanoDetails.estado === 'rehabilitando' || metahumanoDetails.estado === 'rehabilitado'}
                    className={`group relative overflow-hidden text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border cursor-pointer ${
                      metahumanoDetails.estado === 'rehabilitando'
                        ? 'bg-yellow-800/40 border-yellow-500/30 cursor-not-allowed opacity-80'
                        : metahumanoDetails.estado === 'rehabilitado'
                        ? 'bg-emerald-800/40 border-emerald-500/30 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 border-emerald-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-left">
                          {metahumanoDetails.estado === 'rehabilitando' ? '⏳ Rehabilitación en Proceso' :
                           metahumanoDetails.estado === 'rehabilitado' ? '🕊️ Rehabilitación Completada' :
                           '🕊️ Solicitar Rehabilitación'}
                        </h2>
                        <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center group-hover:bg-emerald-400/50 transition-colors">
                          <span className="text-sm">→</span>
                        </div>
                      </div>
                      <p className="text-emerald-100 text-sm text-left leading-relaxed">
                        {metahumanoDetails.estado === 'rehabilitando' ? 'Tu trámite de transición a Héroe está siendo evaluado por las autoridades.' :
                         metahumanoDetails.estado === 'rehabilitado' ? '¡Felicitaciones! Has completado el proceso de reinserción a la sociedad.' :
                         'Inicia el proceso paso a paso supervisado por el gobierno para convertirte en Héroe.'}
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Solicitudes de Archienemigo Recibidas para Villanos */}
            {metahumanoDetails?.tipoMeta === 'villano' && incomingEnemyRequests.length > 0 && (
              <div className="mt-8 bg-slate-800/80 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  ⚔️ Solicitudes de Archienemigo Recibidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingEnemyRequests.map((req) => (
                    <div key={req.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Héroe Solicitante</span>
                          <h4 className="text-lg font-bold text-white">{req.metahumano?.alias || 'Héroe'}</h4>
                          <p className="text-xs text-gray-400">Nombre: {req.metahumano?.nombre}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-600/20 text-yellow-400 border border-yellow-500/20">
                          Pendiente
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm my-3 italic">"{req.descripcion}"</p>
                      <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-850">
                        <button
                          onClick={() => handleResponderSolicitudEnemigo(req.id, 'RECHAZAR')}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          ✕ Rechazar
                        </button>
                        <button
                          onClick={() => handleResponderSolicitudEnemigo(req.id, 'ACEPTAR')}
                          className="px-4 py-1.5 bg-green-600/20 hover:bg-green-600 text-green-200 hover:text-white border border-green-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          ✓ Aceptar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alertas generales de Error o Éxito */}
            {(error || successMessage) && (
              <div className="mt-6">
                {error && (
                  <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
                    <p className="text-red-200 flex items-center">
                      <span className="mr-2">❌</span>
                      {error}
                    </p>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
                    <p className="text-green-200 flex items-center">
                      <span className="mr-2">✅</span>
                      {successMessage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Formulario de Definir Estilo de Vida */}
            {showFormLifestyle && (
              <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-650 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    🌟 Definir Estilo de Vida
                  </h3>
                  <button 
                    onClick={() => setShowFormLifestyle(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleDefinirEstiloVida} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Selecciona tu camino:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setLifestyleRole("HEROE")}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer ${
                          lifestyleRole === 'HEROE'
                            ? 'border-blue-500 bg-blue-600/20 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-gray-400 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-3xl block mb-2">🦸‍♂️</span>
                        <span className="font-bold block">Héroe</span>
                        <span className="text-xs opacity-75">Protector de la justicia</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLifestyleRole("VILLANO")}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer ${
                          lifestyleRole === 'VILLANO'
                            ? 'border-red-500 bg-red-600/20 text-white'
                            : 'border-slate-700 bg-slate-800/50 text-gray-400 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-3xl block mb-2">🦹</span>
                        <span className="font-bold block">Villano</span>
                        <span className="text-xs opacity-75">Sembrador de caos</span>
                      </button>
                    </div>
                  </div>

                  {lifestyleRole === 'HEROE' ? (
                    <div className="space-y-4 bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
                      <h4 className="font-semibold text-blue-400 mb-2">Detalles de Héroe</h4>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                          Nivel de Fama
                        </label>
                        <select
                          value={nivelFama}
                          onChange={(e) => setNivelFama(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Bajo">Bajo</option>
                          <option value="Medio">Medio</option>
                          <option value="Alto">Alto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                          Misión Inicial
                        </label>
                        <input
                          type="text"
                          value={mision}
                          onChange={(e) => setMision(e.target.value)}
                          placeholder="Ej: Proteger el banco central de Metrópolis"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
                      <h4 className="font-semibold text-red-400 mb-2">Detalles de Villano</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            Nivel de Peligrosidad
                          </label>
                          <select
                            value={nivelPeligrosidad}
                            onChange={(e) => setNivelPeligrosidad(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer"
                          >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            Recompensa por captura ($)
                          </label>
                          <input
                            type="number"
                            value={recompensa}
                            onChange={(e) => setRecompensa(e.target.value)}
                            placeholder="Ej: 50000"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                          Motivación Principal
                        </label>
                        <input
                          type="text"
                          value={motivacion}
                          onChange={(e) => setMotivacion(e.target.value)}
                          placeholder="Ej: Venganza o control total del mundo"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-slate-750 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFormLifestyle(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {loading ? "Procesando..." : "Confirmar Estilo de Vida"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Formulario de Solicitud de Enemigos */}
            {showFormEnemy && (
              <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-650 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    🎯 Solicitar Asignación de Enemigo
                  </h3>
                  <button 
                    onClick={() => setShowFormEnemy(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSolicitarEnemigo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Seleccionar Villano
                    </label>
                    <select
                      value={selectedVillanoId}
                      onChange={(e) => setSelectedVillanoId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      required
                    >
                      <option value="">-- Selecciona un Villano --</option>
                      {villanosList.map((villano) => (
                        <option key={villano.id} value={villano.id}>
                          {villano.alias} (Peligrosidad: {villano.nivelPeligrosidad || 'Baja'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Motivo / Descripción de la Solicitud
                    </label>
                    <textarea
                      value={enemyDescription}
                      onChange={(e) => setEnemyDescription(e.target.value)}
                      rows={4}
                      placeholder="Especifica el motivo de la rivalidad o detalles del enfrentamiento estimado..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-750 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFormEnemy(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Formulario de Permiso de Destrucción */}
            {showFormDestruction && (
              <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-650 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    💥 Solicitar Permiso de Destrucción Colateral
                  </h3>
                  <button 
                    onClick={() => setShowFormDestruction(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSolicitarPermisoDestruccion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Motivo del Combate/Evento
                    </label>
                    <input
                      type="text"
                      value={destructionMotivo}
                      onChange={(e) => setDestructionMotivo(e.target.value)}
                      placeholder="Ej: Batalla planificada con mi archienemigo"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Zona Afectada Estimada
                    </label>
                    <input
                      type="text"
                      value={destructionZona}
                      onChange={(e) => setDestructionZona(e.target.value)}
                      placeholder="Ej: Zona portuaria o Plaza Central"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Descripción de Daños Estimados
                    </label>
                    <textarea
                      value={destructionDanos}
                      onChange={(e) => setDestructionDanos(e.target.value)}
                      rows={3}
                      placeholder="Detalles sobre infraestructura comprometida, vehículos, etc..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Ubicación del Incidente/Destrucción (Seleccionar en el mapa)
                    </label>
                    <div 
                      id="destruction-map" 
                      style={{ height: "250px" }} 
                      className="w-full rounded-lg overflow-hidden border border-slate-700 mb-2 relative z-10"
                    ></div>
                    {destructionLat && destructionLng ? (
                      <p className="text-xs text-green-400">
                        Coordenadas seleccionadas: Lat: {destructionLat.toFixed(6)}, Lng: {destructionLng.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400">
                        Haz clic en el mapa para marcar el lugar del incidente.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-750 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFormDestruction(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Formulario de Gestión de Poderes */}
            {showFormPowers && (
              <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-600">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    Gestión de Poderes
                  </h3>
                  <button 
                    onClick={togglePowersForm}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Solicitar Poderes */}
                  <button 
                    onClick={() => cambiarTipoSolicitud("solicitar")}
                    className={`group relative overflow-hidden ${
                      tipoSolicitud === "solicitar" 
                        ? "bg-gradient-to-br from-green-700 to-green-800 border-green-400" 
                        : "bg-gradient-to-br from-green-600 to-green-700 border-green-500/30"
                    } hover:from-green-700 hover:to-green-800 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">✨</div>
                      <h3 className="text-lg font-bold mb-1">Solicitar Poderes</h3>
                      <p className="text-green-100 text-xs">Pide nuevos poderes</p>
                      {tipoSolicitud === "solicitar" && (
                        <div className="mt-2 text-xs bg-green-500/20 rounded px-2 py-1">
                          Sección activa
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Eliminar Poderes */}
                  <button 
                    onClick={() => cambiarTipoSolicitud("eliminar")}
                    className={`group relative overflow-hidden ${
                      tipoSolicitud === "eliminar" 
                        ? "bg-gradient-to-br from-red-700 to-red-800 border-red-400" 
                        : "bg-gradient-to-br from-red-600 to-red-700 border-red-500/30"
                    } hover:from-red-700 hover:to-red-800 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">🗑️</div>
                      <h3 className="text-lg font-bold mb-1">Eliminar Poderes</h3>
                      <p className="text-red-100 text-xs">Desactiva poderes existentes</p>
                      {tipoSolicitud === "eliminar" && (
                        <div className="mt-2 text-xs bg-red-500/20 rounded px-2 py-1">
                          Sección activa
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Verificar Solicitudes */}
                  <button 
                    onClick={() => cambiarTipoSolicitud("verificar")}
                    className={`group relative overflow-hidden ${
                      tipoSolicitud === "verificar" 
                        ? "bg-gradient-to-br from-amber-700 to-amber-800 border-amber-400" 
                        : "bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500/30"
                    } hover:from-amber-700 hover:to-amber-800 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <h3 className="text-lg font-bold mb-1">Verificar Solicitudes</h3>
                      <p className="text-amber-100 text-xs">Revisa el estado de tus poderes</p>
                      {tipoSolicitud === "verificar" && (
                        <div className="mt-2 text-xs bg-amber-500/20 rounded px-2 py-1">
                          Sección activa
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Lista de Poderes Disponibles */}
                {tipoSolicitud === "solicitar" && (
                  <div className="mt-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                      ⚡ Poderes Disponibles
                    </h4>
                    
                    {loading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="text-gray-400 mt-2">Cargando poderes...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
                        <p className="text-red-200 flex items-center">
                          <span className="mr-2">❌</span>
                          {error}
                        </p>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-4">
                        <p className="text-green-200 flex items-center">
                          <span className="mr-2">✅</span>
                          {successMessage}
                        </p>
                      </div>
                    )}
                    
                    {!loading && !error && poderes.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {poderes.map((poder) => (
                          <div key={poder.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-blue-500 transition-all duration-200 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-bold text-white text-lg">{poder.nomPoder}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                poder.categoria === 'FISICO' ? 'bg-red-600 text-red-100' :
                                poder.categoria === 'SENSORIAL' ? 'bg-blue-600 text-blue-100' :
                                poder.categoria === 'MENTAL' ? 'bg-purple-600 text-purple-100' :
                                'bg-gray-600 text-gray-100'
                              }`}>
                                {poder.categoria}
                              </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{poder.descPoder}</p>
                            
                            <div className="space-y-3">
                              <div className="bg-orange-900/30 border border-orange-600/50 rounded-lg p-3">
                                <p className="text-orange-200 text-xs font-bold mb-1 flex items-center">
                                  ⚠️ Debilidad: {poder.debilidad}
                                </p>
                                <p className="text-orange-100 text-xs">{poder.descDebilidad}</p>
                              </div>
                              
                              <div className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                                <div className="flex items-center">
                                  <span className="text-green-400 font-bold text-lg">
                                    💰 ${poder.costoMulta.toLocaleString()}
                                  </span>
                                  <span className="text-gray-400 text-xs ml-2">costo de multa</span>
                                </div>
                                <button 
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                                  onClick={() => solicitarPoder(poder)}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Procesando...
                                    </>
                                  ) : (
                                    <>
                                      ✨ Solicitar
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!loading && !error && poderes.length === 0 && tipoSolicitud === "solicitar" && (
                      <div className="text-center py-8 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="text-6xl mb-4">📭</div>
                        <h5 className="text-xl font-bold text-white mb-2">No hay poderes disponibles</h5>
                        <p className="text-gray-400 mb-4">
                          Puede que ya tengas todos los poderes disponibles o que no haya nuevos poderes en el sistema.
                        </p>
                        <button 
                          onClick={() => cambiarTipoSolicitud("verificar")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Ver mis poderes actuales
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de Mis Poderes - Para eliminar */}
                {tipoSolicitud === "eliminar" && (
                  <div className="mt-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                      🗑️ Mis Poderes - Eliminar
                    </h4>
                    
                    {loading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <p className="text-gray-400 mt-2">Cargando tus poderes...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
                        <p className="text-red-200 flex items-center">
                          <span className="mr-2">❌</span>
                          {error}
                        </p>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-4">
                        <p className="text-green-200 flex items-center">
                          <span className="mr-2">✅</span>
                          {successMessage}
                        </p>
                      </div>
                    )}
                    
                    {!loading && !error && misPoderes.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {misPoderes.filter(metapoder => metapoder.estado === 'APROBADO').map((metapoder) => (
                          <div key={metapoder.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-red-500 transition-all duration-200 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-bold text-white text-lg">{metapoder.poder?.nomPoder || 'Poder Desconocido'}</h5>
                                <p className="text-sm text-gray-400">Dominio: {metapoder.dominio} | Control: {metapoder.nivelControl}%</p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-green-100">
                                {metapoder.estado}
                              </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                              {metapoder.poder?.descPoder || 'Sin descripción disponible'}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="bg-orange-900/30 border border-orange-600/50 rounded-lg p-3">
                                <p className="text-orange-200 text-xs font-bold mb-1">
                                  📅 Adquirido: {new Date(metapoder.fechaAdquisicion).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                                <div className="flex items-center">
                                  <span className="text-red-400 font-bold">
                                    🗑️ Desactivar Poder
                                  </span>
                                </div>
                                <button 
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                                  onClick={() => desactivarPoder(metapoder.id, metapoder.poder?.nomPoder)}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Procesando...
                                    </>
                                  ) : (
                                    <>
                                      🗑️ Eliminar
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!loading && !error && misPoderes.filter(mp => mp.estado === 'APROBADO').length === 0 && (
                      <div className="text-center py-8 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="text-6xl mb-4">🚫</div>
                        <h5 className="text-xl font-bold text-white mb-2">No tienes poderes aprobados</h5>
                        <p className="text-gray-400 mb-4">
                          No tienes poderes aprobados que puedas desactivar en este momento.
                        </p>
                        <button 
                          onClick={() => cambiarTipoSolicitud("solicitar")}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Solicitar nuevos poderes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de Mis Poderes - Para verificar */}
                {tipoSolicitud === "verificar" && (
                  <div className="mt-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                      📋 Estado de Mis Poderes
                    </h4>
                    
                    {loading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        <p className="text-gray-400 mt-2">Cargando estado de poderes...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
                        <p className="text-red-200 flex items-center">
                          <span className="mr-2">❌</span>
                          {error}
                        </p>
                      </div>
                    )}
                    
                    {!loading && !error && misPoderes.length > 0 && (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {/* Filtros por estado */}
                        <div className="flex gap-2 mb-4">
                          <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-xs">
                            ✅ APROBADO ({misPoderes.filter(mp => mp.estado === 'APROBADO').length})
                          </span>
                          <span className="px-3 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs">
                            ⏳ SOLICITADO ({misPoderes.filter(mp => mp.estado === 'SOLICITADO').length})
                          </span>
                          <span className="px-3 py-1 bg-red-600 text-red-100 rounded-full text-xs">
                            ❌ RECHAZADO ({misPoderes.filter(mp => mp.estado === 'RECHAZADO').length})
                          </span>
                        </div>

                        {misPoderes.map((metapoder) => (
                          <div key={metapoder.id} className={`border rounded-lg p-4 transition-all duration-200 ${
                            metapoder.estado === 'APROBADO' ? 'bg-green-900/20 border-green-600' :
                            metapoder.estado === 'SOLICITADO' ? 'bg-yellow-900/20 border-yellow-600' :
                            metapoder.estado === 'RECHAZADO' ? 'bg-red-900/20 border-red-600' :
                            'bg-gray-900/20 border-gray-600'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-bold text-white text-lg mb-1">
                                  {metapoder.poder?.nomPoder || 'Poder Desconocido'}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                  <span>Dominio: <strong>{metapoder.dominio}</strong></span>
                                  <span>Control: <strong>{metapoder.nivelControl}%</strong></span>
                                  <span>Fecha: <strong>{new Date(metapoder.fechaAdquisicion).toLocaleDateString()}</strong></span>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                metapoder.estado === 'APROBADO' ? 'bg-green-600 text-green-100' :
                                metapoder.estado === 'SOLICITADO' ? 'bg-yellow-600 text-yellow-100' :
                                metapoder.estado === 'RECHAZADO' ? 'bg-red-600 text-red-100' :
                                'bg-gray-600 text-gray-100'
                              }`}>
                                {metapoder.estado === 'APROBADO' ? '✅ APROBADO' :
                                 metapoder.estado === 'SOLICITADO' ? '⏳ SOLICITADO' :
                                 metapoder.estado === 'RECHAZADO' ? '❌ RECHAZADO' :
                                 metapoder.estado}
                              </span>
                            </div>
                            
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {metapoder.poder?.descPoder || 'Sin descripción disponible'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!loading && !error && misPoderes.length === 0 && (
                      <div className="text-center py-8 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="text-6xl mb-4">�</div>
                        <h5 className="text-xl font-bold text-white mb-2">Aún no tienes poderes</h5>
                        <p className="text-gray-400 mb-4">
                          No has solicitado ningún poder todavía. ¡Comienza tu aventura como metahumano!
                        </p>
                        <button 
                          onClick={() => cambiarTipoSolicitud("solicitar")}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Solicitar mi primer poder
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
    </MetahumanoLayout>
  );
}

export default Home;