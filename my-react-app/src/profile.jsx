import { useState } from 'react'

function Profile() {
  const [mediaList, setMediaList] = useState([])

  // Profile fields
  const [name, setName] = useState('John Smith')
  const [age, setAge] = useState('22')
  const [instrument, setInstrument] = useState('Piano')
  const [bio, setBio] = useState('')

  const [submittedBio, setSubmittedBio] = useState(null)

  // Edit mode toggle
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
      // Save changes when exiting edit mode
      setSubmittedBio(bio)
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Profile</h1>
        <button className="primary-button" onClick={toggleEditMode}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Editable fields */}
      <div style={{ marginTop: '1rem' }}>
        <p>
          <strong>Name:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            name
          )}
        </p>
        <p>
          <strong>Age:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          ) : (
            age
          )}
        </p>
        <p>
          <strong>Instrument:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
            />
          ) : (
            instrument
          )}
        </p>

        <p><strong>Bio:</strong></p>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            cols={50}
            placeholder="Tell us about yourself..."
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        ) : (
          <p style={{ fontStyle: 'italic' }}>{submittedBio || 'No bio yet.'}</p>
        )}
      </div>

      {/* File upload section */}
      <p style={{ marginTop: '2rem' }}>Upload videos or images:</p>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Media Preview */}
      <div className="media-preview" style={{ marginTop: '2rem' }}>
        {mediaList.map((media, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold' }}>{media.name}</p>
            {media.type === 'image' && (
              <img
                src={media.url}
                alt={`Uploaded ${index}`}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            )}
            {media.type === 'video' && (
              <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
                <source src={media.url} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
