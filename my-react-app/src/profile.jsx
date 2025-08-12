import { useState } from 'react'
import './profile.css'

function Profile() {
  const [mediaList, setMediaList] = useState([])
  const [name, setName] = useState('John Smith')
  const [age, setAge] = useState('22')
  const [instrument, setInstrument] = useState('Piano')
  const [bio, setBio] = useState('')
  const [submittedBio, setSubmittedBio] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const updatedMedia = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : null,
      name: file.name,
    })).filter((item) => item.type !== null)
    setMediaList((prev) => [...prev, ...updatedMedia])
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
            className="profile-file-input"
          />
        </div>

        <div className="media-preview">
          {mediaList.map((media, index) => (
            <div key={index} className="media-card">
              <p className="media-name">{media.name}</p>
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
