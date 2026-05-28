import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, ShieldCheck, Database, FileImage, Copy, Check } from 'lucide-react';
import { verifyCertificate } from '../../api/db';

interface VerificationResult {
  certificate_id: string;
  is_verified: boolean;
  db_record: {
    id: string;
    user_id: string;
    skill: string;
    cert_hash: string;
    tx_hash: string | null;
    contract_address: string | null;
    chain_id: number | null;
    network: string | null;
    verification_status: string;
    image_url: string;
    explorer_url: string | null;
    created_at: string;
  };
  blockchain_record: {
    valid: boolean;
    cert_hash: string;
    student_name: string;
    skill: string;
    issued_at: number;
  };
}

export const VerifyCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  useEffect(() => {
    const runVerification = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await verifyCertificate(id);
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to verify certificate.');
      } finally {
        setLoading(false);
      }
    };
    runVerification();
  }, [id]);

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <h2 className="text-xl font-medium">Verifying Blockchain Credentials...</h2>
          <p className="text-gray-400 text-sm">Querying database & Polygon Testnet smart contract</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Verification Failed</h2>
            <p className="text-red-300 text-sm">{error || 'Certificate records not found or invalid.'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back Home</span>
          </button>
        </div>
      </div>
    );
  }

  const { is_verified, db_record, blockchain_record } = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Top Header Card: Status */}
        <div className={`backdrop-blur-lg border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
          is_verified 
            ? 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-950/10' 
            : 'bg-red-950/20 border-red-500/30 shadow-red-950/10'
        }`}>
          <div className="flex items-center space-x-4">
            {is_verified ? (
              <ShieldCheck className="w-14 h-14 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-14 h-14 text-red-500 shrink-0" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Polygon Testnet
                </span>
                <span className="text-xs font-medium text-gray-400">
                  ID: {db_record.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                {is_verified ? 'Credential Verified' : 'Invalid Credential'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {is_verified 
                  ? 'This certificate has been cryptographically signed and published to the blockchain.' 
                  : 'This certificate hash does not match the blockchain records or has been revoked.'}
              </p>
            </div>
          </div>
          
          <a
            href={db_record.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/25 px-5 py-2.5 rounded-2xl transition-all font-semibold text-sm hover:scale-105 shrink-0"
          >
            <FileImage className="w-4 h-4" />
            <span>View Image File</span>
          </a>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Certificate Metadata (DB + Blockchain Verification) */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Certificate Information</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Recipient</span>
                <span className="text-lg font-semibold text-white">
                  {blockchain_record.student_name || 'Anonymous Learner'}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Certified Skill</span>
                <span className="text-lg font-semibold text-blue-300">
                  {blockchain_record.skill || db_record.skill}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Issue Date</span>
                <span className="text-base text-gray-200">
                  {blockchain_record.issued_at ? formatDate(blockchain_record.issued_at) : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Image Cryptographic Hash (SHA256)</span>
                <div className="bg-black/35 rounded-xl p-3 font-mono text-xs text-gray-300 break-all select-all border border-slate-800">
                  {db_record.cert_hash}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Blockchain Proof */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-800 pb-3 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>On-Chain Cryptographic Proof</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Smart Contract Address</span>
                  <div className="flex items-center justify-between bg-black/35 border border-slate-800 p-3 rounded-xl mt-1">
                    <span className="font-mono text-xs text-gray-300 truncate max-w-[80%]">
                      {db_record.contract_address || '0xRegistryContract'}
                    </span>
                    {db_record.contract_address && (
                      <button
                        onClick={() => handleCopy(db_record.contract_address!, setCopiedContract)}
                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Blockchain Network</span>
                  <span className="text-sm text-gray-200 mt-1 block capitalize">
                    {db_record.network ? db_record.network.replace('-', ' ') : 'Polygon Testnet'} (Chain ID: {db_record.chain_id})
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">Transaction Hash</span>
                  {db_record.tx_hash ? (
                    <div className="flex items-center justify-between bg-black/35 border border-slate-800 p-3 rounded-xl mt-1">
                      <span className="font-mono text-xs text-gray-300 truncate max-w-[80%]">
                        {db_record.tx_hash}
                      </span>
                      <button
                        onClick={() => handleCopy(db_record.tx_hash!, setCopiedTx)}
                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-500 font-medium mt-1 block animate-pulse">
                      Pending confirmation...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {db_record.explorer_url && (
              <a
                href={db_record.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl transition-all font-semibold text-sm hover:scale-[1.02] shadow-lg shadow-blue-900/30 mt-6"
              >
                <span>Verify on PolygonScan</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Certificate Rendering Area */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-center">
          <h3 className="text-lg font-bold text-gray-200">Earned Certificate Preview</h3>
          <p className="text-xs text-gray-400">Cryptographically signed PNG with embedded QR Code</p>
          <div className="relative border border-slate-800 rounded-2xl overflow-hidden mt-4 shadow-2xl max-w-2xl mx-auto">
            <img 
              src={db_record.image_url} 
              alt={`${blockchain_record.student_name}'s Certificate`} 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
export default VerifyCertificate;
