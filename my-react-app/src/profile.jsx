import { useState } from 'react'
function Profile() {
  const [file, setFile] = useState(null)
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }
  const handleUpload = () => {
    if (file) {
      alert(`Uploading: ${file.name}`)
//we need to add the uploading here 
    }
  }
  return (
    <div className="app-container">
      <h1>Your Profile</h1>
      <p>Upload a video!</p>
      <input type="file" onChange={handleFileChange} />
      <button className="primary-button" onClick={handleUpload}>Upload</button>
    </div>
  )
}
export default Profile