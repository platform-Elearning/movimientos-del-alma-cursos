import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthUtils from '../../../utils/authUtils';
import './SettingsManagement.css';

const SettingsManagement = () => {
  const [teacher, setTeacher] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    bio: '',
    experience_years: '',
    specialties: []
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const specialtiesOptions = [
    'Danza Contemporánea',
    'Ballet Clásico', 
    'Jazz Dance',
    'Hip Hop',
    'Danza Folklórica',
    'Tango',
    'Salsa',
    'Bachata',
    'Flamenco',
    'Danza Moderna'
  ];

  useEffect(() => {
    if (!AuthUtils.checkAndCleanExpiredToken()) {
      navigate('/login');
      return;
    }
    loadTeacherProfile();
  }, [navigate]);

  const loadTeacherProfile = async () => {
    try {
      setIsLoading(true);
      
      const token = AuthUtils.getToken();
      const decodedToken = AuthUtils.decodeToken(token);
      
      if (decodedToken && (decodedToken.role === 'teacher' || decodedToken.role === 'admin')) {
        setTimeout(() => {
          const mockTeacher = {
            id: decodedToken.id,
            name: decodedToken.name || 'Julián',
            lastname: 'González',
            email: decodedToken.email || 'julian@gmail.com',
            phone: '+54 351 123-4567',
            bio: 'Profesor de danza con más de 10 años de experiencia. Especializado en técnicas contemporáneas y ballet clásico.',
            experience_years: '10',
            specialties: ['Danza Contemporánea', 'Ballet Clásico'],
            profile_image: null
          };
          
          setTeacher(mockTeacher);
          setProfileData({
            name: mockTeacher.name,
            lastname: mockTeacher.lastname,
            email: mockTeacher.email,
            phone: mockTeacher.phone,
            bio: mockTeacher.bio,
            experience_years: mockTeacher.experience_years,
            specialties: mockTeacher.specialties
          });
          
          if (mockTeacher.profile_image) {
            setPreviewImage(mockTeacher.profile_image);
          }
          
          setIsLoading(false);
        }, 1000);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTeacher(prev => ({ ...prev, ...profileData }));
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      if (passwordData.new_password.length < 6) {
        alert('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      alert('Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      alert('Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-management loading">
        <div className="loading-spinner">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="settings-management">
      <header className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/profesores/dashboard')}
        >
          ← Volver al Dashboard
        </button>
        <h1>Configuración del Perfil</h1>
      </header>

      <div className="settings-container">
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Perfil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Contraseña
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferencias
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="settings-tab profile-tab">
            <div className="profile-section">
              <h2>Información Personal</h2>
              
              <div className="profile-image-section">
                <div className="current-image">
                  <img 
                    src={previewImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name + ' ' + profileData.lastname)}&background=4CAF50&color=fff&size=120`}
                    alt="Foto de perfil"
                    className="profile-preview"
                  />
                </div>
                <div className="image-controls">
                  <label htmlFor="profile-image" className="btn-secondary">
                    📷 Cambiar Foto
                  </label>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {previewImage && (
                    <button 
                      className="btn-danger small"
                      onClick={() => {
                        setPreviewImage(null);
                        setProfileImage(null);
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="lastname"
                    value={profileData.lastname}
                    onChange={handleProfileChange}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="+54 351 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Biografía</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Cuéntanos sobre tu experiencia y enfoque como profesor..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Años de Experiencia</label>
                <input
                  type="number"
                  name="experience_years"
                  value={profileData.experience_years}
                  onChange={handleProfileChange}
                  placeholder="10"
                  min="0"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label>Especialidades</label>
                <div className="specialties-grid">
                  {specialtiesOptions.map(specialty => (
                    <div 
                      key={specialty}
                      className={`specialty-item ${profileData.specialties.includes(specialty) ? 'selected' : ''}`}
                      onClick={() => handleSpecialtyToggle(specialty)}
                    >
                      <span className="specialty-name">{specialty}</span>
                      {profileData.specialties.includes(specialty) && (
                        <span className="specialty-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-primary"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="settings-tab password-tab">
            <div className="password-section">
              <h2>Cambiar Contraseña</h2>
              <p className="section-description">
                Por seguridad, te pedimos tu contraseña actual para confirmar los cambios.
              </p>

              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 6 caracteres"
                />
                <small className="form-hint">
                  La contraseña debe tener al menos 6 caracteres
                </small>
              </div>

              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Repite la nueva contraseña"
                />
                {passwordData.new_password && passwordData.confirm_password && 
                 passwordData.new_password !== passwordData.confirm_password && (
                  <small className="form-error">
                    Las contraseñas no coinciden
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button 
                  className="btn-primary"
                  onClick={handleChangePassword}
                  disabled={isSaving || !passwordData.current_password || 
                           !passwordData.new_password || !passwordData.confirm_password ||
                           passwordData.new_password !== passwordData.confirm_password}
                >
                  {isSaving ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="settings-tab preferences-tab">
            <div className="preferences-section">
              <h2>Preferencias</h2>
              
              <div className="preference-group">
                <h3>Notificaciones</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Notificaciones por Email</label>
                    <p>Recibir notificaciones de nuevos mensajes y actividades</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Notificaciones Push</label>
                    <p>Notificaciones en tiempo real en el navegador</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="preference-group">
                <h3>Privacidad</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Perfil Público</label>
                    <p>Permitir que los estudiantes vean tu perfil completo</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Mostrar Estado de Conexión</label>
                    <p>Mostrar cuando estés en línea a los estudiantes</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="preference-group">
                <h3>Interfaz</h3>
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Tema Oscuro</label>
                    <p>Cambiar a tema oscuro para mejor visualización nocturna</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <label>Idioma</label>
                    <p>Seleccionar idioma de la interfaz</p>
                  </div>
                  <select className="preference-select">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary">
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManagement;
