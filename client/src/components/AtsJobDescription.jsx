import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Loader2, Sparkles, ScanLine } from 'lucide-react'

const AtsJobDescription = ({ disabled, setDisabled, resumeData, description, setDescription, setAtsData, atsData, setAtsComparison, atsComparison }) => {
    const { token } = useSelector(state => state.auth)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [atsCheck, setAtsCheck] = useState(false)

    const atsScoreCheck = async () => {
        setIsChecking(true)
        try {
            const res = await api.post('/api/ai/ats-score-checker', { resumeData: resumeData, jobDescription: description }, {
                headers: {
                    Authorization: token
                }
            })
            setAtsCheck(true)
            setAtsData(res.data)
            console.log(res.data)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        } finally {
            setDisabled(false)
            setIsChecking(false)
        }
    }

    const generateResume = async () => {
        setIsGenerating(true)
        try {
            setAtsData(null)
            const { data } = await api.post('/api/ai/ats-resume', { data: resumeData, description }, {
                headers: {
                    Authorization: token
                }
            })
            setAtsComparison(data)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        } finally {
            setDisabled(false)
            setIsGenerating(false)
        }
    }


    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900' > Job Description </h3>
                    <p className='text-sm text-gray-500'>Add job details for ATS match</p>
                </div>
                <div className='flex flex-col gap-2'>
                    <button onClick={atsScoreCheck} disabled={isChecking || isGenerating || disabled || description == ""} className={`flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        {isChecking ? (<Loader2 className='size-4 animate-spin' />) : (<ScanLine className="size-4" />)}
                        {isChecking ? 'Checking...' : 'ATS Score'}
                    </button>
                    {(atsCheck || atsComparison) &&
                        <button onClick={generateResume} disabled={isGenerating || isChecking || disabled || !atsData} className={`flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            {isGenerating ? (<Loader2 className='size-4 animate-spin' />) : (<Sparkles className="size-4" />)}
                            {isGenerating ? "Optimizing Resume..." : "Improve ATS Score"}
                        </button>}
                </div>
            </div>
            <div className="mt-6">
                <textarea value={description || ""} onChange={(e) => setDescription(e.target.value)} rows={7} className='w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-1g focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none' placeholder="Paste the job description to tailor your resume effectively..." />
                <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center'> Tip: Include the full job post for better keyword matching. </p>
            </div>
        </div >
    )
}

export default AtsJobDescription