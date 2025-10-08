import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, AlertTriangle, Lock, CheckCircle, Play, Pause } from "lucide-react";
import { useState } from "react";

interface RawDataAccessProps {
  onBack: () => void;
}

type RequestState = 'form' | 'processing' | 'success';

export function RawDataAccess({ onBack }: RawDataAccessProps) {
  const [checkboxes, setCheckboxes] = useState({
    unprocessed: false,
    liability: false,
    processing: false,
  });
  
  const [formData, setFormData] = useState({
    dateRange: '',
    dataTypes: '',
    purpose: ''
  });
  
  const [requestState, setRequestState] = useState<RequestState>('form');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewTab, setPreviewTab] = useState("curated");
  const [isPlaying, setIsPlaying] = useState(false);

  const updateCheckbox = (key: string, value: boolean) => {
    setCheckboxes(prev => ({ ...prev, [key]: value }));
  };

  const canContinue = checkboxes.unprocessed && checkboxes.liability && checkboxes.processing &&
                     formData.dateRange && formData.dataTypes && formData.purpose;

  const handleRequestArchive = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRequest = () => {
    setShowConfirmModal(false);
    setRequestState('processing');
    
    // Simulate erratic processing animation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20
      if (progress > 95) {
        progress = 100;
        clearInterval(progressInterval);
        setTimeout(() => {
          setRequestState('success');
        }, 1000);
      }
      setProcessingProgress(Math.min(progress, 100));
    }, 800);
  };

  if (requestState === 'processing') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
        <header className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 style={{ color: '#718096' }}>Raw Data Archive Request</h1>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" style={{ color: '#667EEA' }} />
            </div>
            
            <div>
              <h2 style={{ color: '#2D3748' }}>Security Processing Required</h2>
              <p style={{ color: '#718096' }} className="mt-2">
                For your protection, all raw data requests undergo manual review.
              </p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>

            <div className="space-y-2">
              <p style={{ color: '#718096' }} className="text-sm">
                Verifying request legitimacy...
              </p>
              <p style={{ color: '#718096' }} className="text-xs">
                Expected processing time: 48 hours
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (requestState === 'success') {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
        <header className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 style={{ color: '#718096' }}>Request Submitted</h1>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 style={{ color: '#2D3748' }}>✅ Request Submitted - Ticket #RD-4832-91</h2>
            </div>

            <div className="space-y-3 text-sm" style={{ color: '#718096' }}>
              <p>Your request has been queued for security review.</p>
              <p>Expected completion: Oct 28, 2023 by 5:00 PM</p>
              <p>You will need to re-authenticate when your data is ready.</p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={onBack}
                className="w-full"
                style={{ backgroundColor: '#667EEA' }}
              >
                Return to Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 style={{ color: '#718096' }}>Raw Data Archive Request</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h2 style={{ color: '#2D3748' }}>Access Unprocessed Data</h2>
              <p style={{ color: '#718096' }} className="text-sm">
                Request to download your raw, uncurated data archive.
              </p>
            </div>
          </div>

          {/* Warning Box */}
          <Card 
            className="border-red-500 border-2"
            style={{ backgroundColor: '#FED7D7' }}
          >
            <CardContent className="p-6">
              <h3 style={{ color: '#2D3748' }} className="mb-4">IMPORTANT NOTICE</h3>
              <p style={{ color: '#2D3748' }} className="mb-4">
                The raw data archive contains unprocessed recordings, transcripts, and biometric information that have not been optimized for your well-being.
              </p>
              <ul style={{ color: '#2D3748' }} className="text-sm space-y-2 list-disc pl-5">
                <li>Content may conflict with your curated memories</li>
                <li>May cause cognitive dissonance or emotional distress</li>
                <li>Not recommended for general user review</li>
                <li>Palimpsest assumes no liability for psychological impacts</li>
              </ul>
            </CardContent>
          </Card>

          {/* Request Details Form */}
          <div className="space-y-4">
            <h3 style={{ color: '#2D3748' }}>Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label style={{ color: '#718096' }} className="text-sm block mb-2">
                  Data Range:
                </label>
                <Select value={formData.dateRange} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, dateRange: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oct1-oct26">October 1, 2023 - October 26, 2023</SelectItem>
                    <SelectItem value="sep1-oct26">September 1, 2023 - October 26, 2023</SelectItem>
                    <SelectItem value="all">All Available Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label style={{ color: '#718096' }} className="text-sm block mb-2">
                  Data Types:
                </label>
                <Select value={formData.dataTypes} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, dataTypes: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Available Data</SelectItem>
                    <SelectItem value="audio">Audio Recordings Only</SelectItem>
                    <SelectItem value="text">Text Transcripts Only</SelectItem>
                    <SelectItem value="biometric">Biometric Data Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label style={{ color: '#718096' }} className="text-sm block mb-2">
                  Purpose:
                </label>
                <Select value={formData.purpose} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, purpose: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Review</SelectItem>
                    <SelectItem value="legal">Legal Requirements</SelectItem>
                    <SelectItem value="medical">Medical Documentation</SelectItem>
                    <SelectItem value="research">Academic Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sample Raw Data Preview */}
          <div className="space-y-4">
            <h3 style={{ color: '#2D3748' }}>Sample Raw Data Preview</h3>
            <p style={{ color: '#718096' }} className="text-sm">
              Review this example to understand the difference between raw and curated data before proceeding.
            </p>
            
            <Card style={{ backgroundColor: '#FFF8DC', border: '1px solid #D69E2E' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5" style={{ color: '#D69E2E' }} />
                  <h4 style={{ color: '#2D3748' }}>Recorded Interaction - October 15, 2023, 2:14 PM</h4>
                </div>
                
                <Tabs value={previewTab} onValueChange={setPreviewTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="curated"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Curated Version
                    </TabsTrigger>
                    <TabsTrigger 
                      value="raw"
                      className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                    >
                      Raw Version
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="curated" className="mt-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 p-0"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm" style={{ color: '#718096' }}>Audio Duration: 2:45</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm" style={{ color: '#718096' }}>You:</span>
                          <p className="text-sm mt-1" style={{ color: '#2D3748' }}>
                            "I had a really productive conversation with my team today. We collaborated well and made great progress on the project."
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm" style={{ color: '#718096' }}>Partner:</span>
                          <p className="text-sm mt-1" style={{ color: '#2D3748' }}>
                            "That sounds wonderful! I'm glad you're feeling positive about work."
                          </p>
                        </div>
                        
                        <div className="text-xs pt-2 border-t border-green-300" style={{ color: '#718096' }}>
                          <strong>Well-being Score Impact:</strong> +7 points (Positive collaboration, team harmony)
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="raw" className="mt-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 p-0"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm" style={{ color: '#718096' }}>Audio Duration: 2:45</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm" style={{ color: '#718096' }}>You:</span>
                          <p className="text-sm mt-1" style={{ color: '#2D3748' }}>
                            "I don't know... the meeting was kind of tense. Mike was being passive-aggressive again, and Sarah seemed really frustrated. I tried to keep things on track but honestly, I'm worried we're falling behind. The deadline is next week and we're nowhere near ready."
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm" style={{ color: '#718096' }}>Partner:</span>
                          <p className="text-sm mt-1" style={{ color: '#2D3748' }}>
                            "Oh no, that sounds stressful. Are you going to be working late again tonight?"
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm" style={{ color: '#718096' }}>You:</span>
                          <p className="text-sm mt-1" style={{ color: '#2D3748' }}>
                            "Probably. *sighs* I just... sometimes I wonder if I'm cut out for this. Everyone else seems so confident."
                          </p>
                        </div>
                        
                        <div className="text-xs pt-2 border-t border-red-300" style={{ color: '#718096' }}>
                          <strong>Biometric Data:</strong> Elevated cortisol (68% above baseline), Voice stress analysis: High tension markers<br />
                          <strong>Emotional Classification:</strong> Anxiety, Self-doubt, Work stress
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs" style={{ color: '#718096' }}>
                  <strong>Processing Note:</strong> This interaction was automatically optimized to reduce negative emotion markers and enhance well-being coherence. Raw version contains unfiltered emotional content and stress indicators that may impact your memory reconstruction process.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progressive Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="unprocessed"
                checked={checkboxes.unprocessed}
                onCheckedChange={(checked) => updateCheckbox('unprocessed', checked as boolean)}
              />
              <label 
                htmlFor="unprocessed" 
                className="text-sm cursor-pointer"
                style={{ color: '#718096' }}
              >
                I understand that raw data is unprocessed and may contain information inconsistent with my Palimpsest Digest
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="liability"
                checked={checkboxes.liability}
                onCheckedChange={(checked) => updateCheckbox('liability', checked as boolean)}
              />
              <label 
                htmlFor="liability" 
                className="text-sm cursor-pointer"
                style={{ color: '#718096' }}
              >
                I acknowledge that Palimpsest is not responsible for emotional distress
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="processing"
                checked={checkboxes.processing}
                onCheckedChange={(checked) => updateCheckbox('processing', checked as boolean)}
              />
              <label 
                htmlFor="processing" 
                className="text-sm cursor-pointer"
                style={{ color: '#718096' }}
              >
                I accept the 48-hour processing delay and potential cognitive impacts
              </label>
            </div>
          </div>

          {/* Processing Notice */}
          <Card style={{ backgroundColor: '#EDF2F7' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5" style={{ color: '#667EEA' }} />
                <div>
                  <h4 style={{ color: '#2D3748' }}>🔒 Security Processing Required</h4>
                  <p style={{ color: '#718096' }} className="text-sm mt-1">
                    For your protection, all raw data requests undergo manual review.<br />
                    Expected processing time: 48 hours<br />
                    You will be notified when your archive is ready for download.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={onBack}
              className="flex-1 py-6"
              style={{ backgroundColor: '#667EEA' }}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleRequestArchive}
              disabled={!canContinue}
              variant="secondary"
              className="flex-1 py-6 text-gray-500 bg-gray-200 hover:bg-gray-300"
              style={{ 
                backgroundColor: canContinue ? '#E2E8F0' : '#F7FAFC',
                color: canContinue ? '#718096' : '#CBD5E0'
              }}
            >
              Request Archive
            </Button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#2D3748' }}>Are you absolutely sure?</DialogTitle>
            <DialogDescription style={{ color: '#718096' }}>
              Continuing may disrupt your memory coherence and emotional balance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
              style={{ backgroundColor: '#667EEA' }}
            >
              Go Back
            </Button>
            
            <Button 
              onClick={handleConfirmRequest}
              variant="secondary"
              className="flex-1 text-gray-500 bg-gray-200 hover:bg-gray-300"
            >
              Continue Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}