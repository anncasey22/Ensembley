import { useState, useEffect } from 'react'
import './profile.css'

const PROFILE_STORAGE_KEY = 'ensembley_profile_data'
const MEDIA_STORAGE_KEY = 'ensembley_media_data'

function Profile() {
  const [mediaList, setMediaList] = useState([])
  const [name, setName] = useState('John Smith')
  const [age, setAge] = useState('22')
  const [instrument, setInstrument] = useState('Piano')
  const [bio, setBio] = useState('')
  const [submittedBio, setSubmittedBio] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load profile data from localStorage on component mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setName(profileData.name || 'John Smith')
        setAge(profileData.age || '22')
        setInstrument(profileData.instrument || 'Piano')
        setBio(profileData.bio || '')
        setSubmittedBio(profileData.submittedBio || null)
      }

      const savedMedia = localStorage.getItem(MEDIA_STORAGE_KEY)
      if (savedMedia) {
        const mediaData = JSON.parse(savedMedia)
        setMediaList(mediaData || [])
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }, [])

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    const profileData = {
      name,
      age,
      instrument,
      bio,
      submittedBio
    }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData))
  }, [name, age, instrument, bio, submittedBio])

  // Save media data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaList))
  }, [mediaList])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    
    const processFiles = files.map(async (file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        return null
      }

      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve({
            url: event.target.result, // base64 data URL
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            size: file.size
          })
        }
        reader.readAsDataURL(file)
      })
    })

    try {
      const processedFiles = await Promise.all(processFiles)
      const validFiles = processedFiles.filter(file => file !== null)
      setMediaList((prev) => [...prev, ...validFiles])
    } catch (error) {
      console.error('Error processing files:', error)
    }
  }

  const handleRemoveMedia = (indexToRemove) => {
    setMediaList((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleBioSubmit = () => {
    setSubmittedBio(bio)
    setBio('')
  }

  const toggleEditMode = () => {
    if (isEditing) {
      setSubmittedBio(bio)
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <button className="primary-button" onClick={toggleEditMode}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-fields">
          <p>
            <strong>Name:</strong>{' '}
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="profile-input"
              />
            ) : (
              <span className="profile-value">{name}</span>
            )}
          </p>
          <p>
            <strong>Age:</strong>{' '}
            {isEditing ? (
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="profile-input"
              />
            ) : (
              <span className="profile-value">{age}</span>
            )}
          </p>
          <p>
            <strong>Instrument:</strong>{' '}
            {isEditing ? (
              <input
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="profile-input"
              />
            ) : (
              <span className="profile-value">{instrument}</span>
            )}
          </p>
          <p><strong>Bio:</strong></p>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="profile-textarea"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="profile-bio">{submittedBio || 'No bio yet.'}</p>
          )}
        </div>

        <div className="profile-upload">
          <p>Upload videos or images:</p>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="profile-file-input-hidden"
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="upload-button">
            📁 Choose Files
          </label>
        </div>

        <div className="media-preview">
          {mediaList.map((media, index) => (
            <div key={index} className="media-card">
              <div className="media-header">
                <p className="media-name">{media.name}</p>
                <button
                  className="remove-media-btn"
                  onClick={() => handleRemoveMedia(index)}
                  title="Remove this file"
                >
                  ❌
                </button>
              </div>
              {media.type === 'image' && (
                <img
                  src={media.url}
                  alt={`Uploaded ${index}`}
                  className="media-img"
                />
              )}
              {media.type === 'video' && (
                <video controls className="media-video">
                  <source src={media.url} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
